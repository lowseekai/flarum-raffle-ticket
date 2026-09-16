<?php

namespace Ziven\GuaGuaLe\Controllers;

use Flarum\Foundation\ValidationException;
use Flarum\Http\RequestUtil;
use Flarum\Locale\Translator;
use Flarum\Notification\NotificationSyncer;
use Illuminate\Database\ConnectionInterface;
use Illuminate\Support\Carbon;
use Psr\Http\Message\ServerRequestInterface;
use Ramon\PointSystem\Repository\PointsRepository;
use Ziven\GuaGuaLe\Model\GuaGuaLePurchase;
use Ziven\GuaGuaLe\Notification\GuaGuaLeBlueprint;

class GuaGuaLePurchaseUpdateController extends AbstractJsonApiController
{
    public function __construct(
        private ConnectionInterface $db,
        private PointsRepository $points,
        private NotificationSyncer $notifications,
        private Translator $translator
    ) {
    }

    public function handle(ServerRequestInterface $request): \Psr\Http\Message\ResponseInterface
    {
        $actor = RequestUtil::getActor($request);
        $actor->assertRegistered();

        if (!$actor->can('ziven.zivenAllowGuaGuaLe')) {
            return $this->response([]);
        }

        $attributes = $request->getParsedBody()['data']['attributes'] ?? [];
        $purchaseId = filter_var(
            $attributes['guagualePurchaseID'] ?? $request->getQueryParams()['purchase_id'] ?? null,
            FILTER_VALIDATE_INT
        );
        if (!$purchaseId || $purchaseId < 1) {
            throw $this->validation('ziven-guaguale.forum.guaguale-open-error');
        }

        $purchase = $this->db->transaction(function () use ($actor, $purchaseId): GuaGuaLePurchase {
            /** @var GuaGuaLePurchase|null $purchase */
            $purchase = GuaGuaLePurchase::query()
                ->whereKey($purchaseId)
                ->where('user_id', $actor->id)
                ->lockForUpdate()
                ->first();

            if (!$purchase) {
                throw $this->validation('ziven-guaguale.forum.guaguale-open-error');
            }

            if ($purchase->opened) {
                throw $this->validation('ziven-guaguale.forum.guaguale-open-error-already-opened');
            }

            $result = json_decode((string) $purchase->pruchase_result, true);
            if (!is_array($result)) {
                $result = [];
            }

            $winTotal = 0;
            foreach ($result as $value => $count) {
                $winTotal += (int) round((float) $value) * max(0, (int) $count);
            }

            if ($winTotal > 0) {
                $this->points->award(
                    $actor,
                    $winTotal,
                    'raffle_ticket.win',
                    'ziven-guaguale-purchase',
                    (int) $purchase->id
                );
            }

            $purchase->pruchase_win_total = $winTotal;
            $purchase->opened = true;
            $purchase->open_at = Carbon::now('Asia/Shanghai');
            $purchase->save();

            return $purchase;
        });

        $this->notifications->sync(new GuaGuaLeBlueprint($purchase), [$actor]);

        $include = $this->include($request);
        $included = [];
        $purchase->load(array_intersect($include, ['guagualeData', 'purchasedUser']));

        return $this->response([
            $this->purchaseResource($purchase, $include, $included),
        ], $included);
    }

    private function validation(string $key): ValidationException
    {
        return new ValidationException([
            'message' => $this->translator->trans($key),
        ]);
    }
}
