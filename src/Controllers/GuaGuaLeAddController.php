<?php

namespace Ziven\GuaGuaLe\Controllers;

use Ziven\GuaGuaLe\Model\GuaGuaLe;
use Ziven\GuaGuaLe\Model\GuaGuaLeTickets;

use Flarum\Settings\SettingsRepositoryInterface;
use Flarum\Foundation\ValidationException;
use Flarum\Locale\Translator;
use Illuminate\Database\ConnectionInterface;
use Psr\Http\Message\ServerRequestInterface;
use Illuminate\Support\Carbon;

class GuaGuaLeAddController extends AbstractJsonApiController
{
    protected $settings;
    protected $translator;

    public function __construct(
        Translator $translator,
        SettingsRepositoryInterface $settings,
        private ConnectionInterface $db
    ){
        $this->settings = $settings;
        $this->translator = $translator;
    }

    public function handle(ServerRequestInterface $request): \Psr\Http\Message\ResponseInterface
    {
        $actor = $this->actor($request);
        $actor->assertAdmin();

        $requestData = $request->getParsedBody()['data']['attributes'] ?? [];

        $amount = filter_var($requestData['amount'] ?? null, FILTER_VALIDATE_INT);
        $cost = filter_var($requestData['cost'] ?? null, FILTER_VALIDATE_INT);
        $limit = filter_var($requestData['limit'] ?? 0, FILTER_VALIDATE_INT);
        $settings = $requestData['settings'] ?? null;
        if (is_string($settings)) {
            $settings = json_decode($settings, true);
        }

        if(
            !is_array($requestData)
            || trim((string) ($requestData['title'] ?? '')) === ''
            || !$amount
            || $amount < 1
            || $cost === false
            || $cost < 0
            || $limit === false
            || $limit < 0
            || !is_array($settings)
            || !is_array($settings['ratio'] ?? null)
        ){
            throw new ValidationException([
                'message' => $this->translator->trans('ziven-guaguale.admin.guaguale-add-error'),
            ]);
        }

        $defaultTimezone = 'Asia/Shanghai';
        $settingTimezone = $this->settings->get('ziven-guaguale.guagualeTimezone', $defaultTimezone);

        if (! in_array($settingTimezone, timezone_identifiers_list(), true)) {
            $settingTimezone = $defaultTimezone;
        }

        $guaguaLeData = $this->db->transaction(function () use (
            $requestData,
            $amount,
            $cost,
            $limit,
            $settings,
            $settingTimezone
        ): GuaGuaLe {
            $guaguaLeData = new GuaGuaLe();
            $guaguaLeData->title = trim((string) $requestData['title']);
            $guaguaLeData->desc = trim((string) ($requestData['desc'] ?? ''));
            $guaguaLeData->image = trim((string) ($requestData['image'] ?? '')) ?: null;
            $guaguaLeData->color = $guaguaLeData->image ? null : ($requestData['color'] ?? null);
            $guaguaLeData->amount = $amount;
            $guaguaLeData->cost = $cost;
            $guaguaLeData->limit = $limit;
            $guaguaLeData->settings = is_string($requestData['settings'] ?? null)
                ? $requestData['settings']
                : json_encode($settings, JSON_THROW_ON_ERROR);
            $guaguaLeData->activated = true;
            $guaguaLeData->assigned_at = Carbon::now($settingTimezone);
            $guaguaLeData->save();

            $guagualeTicketList = [];
            foreach ($settings['ratio'] as $key => $value) {
                $winPrice = max(0, (int) round((float) $key));
                $winAmount = max(0, (int) $value);

                for ($i = 0; $i < $winAmount; $i++) {
                    $guagualeTicketList[] = [
                        'gua_id' => $guaguaLeData->id,
                        'value' => $winPrice,
                    ];
                }
            }

            shuffle($guagualeTicketList);
            if (count($guagualeTicketList) !== $amount) {
                throw new ValidationException([
                    'message' => $this->translator->trans('ziven-guaguale.admin.guaguale-data-setting-invalid'),
                ]);
            }

            GuaGuaLeTickets::insert($guagualeTicketList);

            return $guaguaLeData;
        });

        return $this->response([$this->raffleResource($guaguaLeData)]);
    }
}
