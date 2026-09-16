<?php

namespace Ziven\GuaGuaLe\Controllers;

use Flarum\Foundation\ValidationException;
use Flarum\Http\RequestUtil;
use Flarum\Locale\Translator;
use Flarum\Settings\SettingsRepositoryInterface;
use Illuminate\Contracts\Events\Dispatcher;
use Illuminate\Database\ConnectionInterface;
use Illuminate\Support\Carbon;
use Psr\Http\Message\ServerRequestInterface;
use Ramon\PointSystem\Repository\PointsRepository;
use Ziven\GuaGuaLe\Model\GuaGuaLe;
use Ziven\GuaGuaLe\Model\GuaGuaLePurchase;
use Ziven\GuaGuaLe\Model\GuaGuaLePurchaseCount;
use Ziven\GuaGuaLe\Model\GuaGuaLeTickets;

class GuaGuaLePurchaseController extends AbstractJsonApiController
{
    public function __construct(
        private ConnectionInterface $db,
        private PointsRepository $points,
        private Translator $translator,
        private SettingsRepositoryInterface $settings
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
        $purchaseCount = filter_var($attributes['guagualePurchaseCount'] ?? null, FILTER_VALIDATE_INT);
        $guaId = filter_var($attributes['guagualeID'] ?? null, FILTER_VALIDATE_INT);

        if (!$purchaseCount || $purchaseCount < 1 || !$guaId || $guaId < 1) {
            throw $this->validation('ziven-guaguale.forum.purchase-error');
        }

        $purchase = $this->db->transaction(function () use ($actor, $purchaseCount, $guaId): GuaGuaLePurchase {
            /** @var GuaGuaLe|null $raffle */
            $raffle = GuaGuaLe::query()
                ->whereKey($guaId)
                ->where('activated', true)
                ->lockForUpdate()
                ->first();

            if (!$raffle) {
                throw $this->validation('ziven-guaguale.forum.purchase-error');
            }

            $remaining = (int) $raffle->amount - (int) $raffle->purchased;
            if ($purchaseCount > $remaining) {
                throw $this->validation('ziven-guaguale.forum.purchase-error-not-enough-tickets');
            }

            $cost = max(0, (int) round($raffle->cost));
            $costTotal = $cost * $purchaseCount;

            $purchasedCount = GuaGuaLePurchaseCount::query()
                ->where('user_id', $actor->id)
                ->where('gua_id', $raffle->id)
                ->lockForUpdate()
                ->first();

            $currentUserCount = (int) ($purchasedCount?->total_pruchase_count ?? 0);
            if ((int) $raffle->limit > 0 && $currentUserCount + $purchaseCount > (int) $raffle->limit) {
                throw $this->validation('ziven-guaguale.forum.guaguale-purchase-exceed-limit');
            }

            $tickets = GuaGuaLeTickets::query()
                ->where('gua_id', $raffle->id)
                ->where(function ($query) {
                    $query->whereNull('flag')->orWhere('flag', '');
                })
                ->orderBy('id')
                ->limit($purchaseCount)
                ->lockForUpdate()
                ->get();

            if ($tickets->count() !== $purchaseCount) {
                throw $this->validation('ziven-guaguale.forum.purchase-error-not-enough-tickets');
            }

            try {
                $this->points->deduct(
                    $actor,
                    $costTotal,
                    'raffle_ticket.purchase',
                    'ziven-guaguale',
                    (int) $raffle->id
                );
            } catch (\DomainException $exception) {
                if ($exception->getMessage() === 'Insufficient point balance') {
                    throw $this->validation('ziven-guaguale.forum.purchase-error-insufficient-fund');
                }

                throw $exception;
            }

            $result = [0 => 0];
            foreach ($tickets as $ticket) {
                $value = (int) round($ticket->value);
                $result[$value] = ($result[$value] ?? 0) + 1;
            }

            GuaGuaLeTickets::query()->whereIn('id', $tickets->pluck('id'))->delete();

            $raffle->purchased = (int) $raffle->purchased + $purchaseCount;
            $raffle->save();

            if ($purchasedCount) {
                $purchasedCount->total_pruchase_count = $currentUserCount + $purchaseCount;
                $purchasedCount->save();
            } else {
                GuaGuaLePurchaseCount::query()->create([
                    'user_id' => (int) $actor->id,
                    'gua_id' => (int) $raffle->id,
                    'total_pruchase_count' => $purchaseCount,
                ]);
            }

            $timezone = $this->settings->get('ziven-guaguale.guagualeTimezone', 'Asia/Shanghai');
            if (!in_array($timezone, timezone_identifiers_list(), true)) {
                $timezone = 'Asia/Shanghai';
            }

            $purchase = new GuaGuaLePurchase();
            $purchase->title = $raffle->title;
            $purchase->gua_id = (int) $raffle->id;
            $purchase->user_id = (int) $actor->id;
            $purchase->pruchase_count = $purchaseCount;
            $purchase->pruchase_cost = $cost;
            $purchase->pruchase_cost_total = $costTotal;
            $purchase->pruchase_win_total = 0;
            $purchase->opened = false;
            $purchase->open_at = null;
            $purchase->pruchase_result = json_encode($result, JSON_THROW_ON_ERROR);
            $purchase->assigned_at = Carbon::now($timezone);
            $purchase->save();

            return $purchase;
        });

        $include = $this->include($request, ['guagualeData']);
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
