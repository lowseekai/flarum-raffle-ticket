<?php

namespace Ziven\GuaGuaLe\Controllers;

use Ziven\GuaGuaLe\Model\GuaGuaLePurchase;
use Psr\Http\Message\ServerRequestInterface;

class GuaGuaLePurchaseHistorySummaryController extends AbstractJsonApiController
{
    public function handle(ServerRequestInterface $request): \Psr\Http\Message\ResponseInterface
    {
        $actor = $this->actor($request);

        if (! $actor->can('ziven.zivenAllowGuaGuaLe')) {
            return $this->response([]);
        }

        $summary = [
            'id' => 'summary',
            'costTotal' => round((float) GuaGuaLePurchase::query()
                ->where('user_id', $actor->id)
                ->sum('pruchase_cost_total'), 2),
            'winTotal' => round((float) GuaGuaLePurchase::query()
                ->where('user_id', $actor->id)
                ->sum('pruchase_win_total'), 2),
        ];

        return $this->response([
            $this->resource('guagualePurchaseHistorySummary', $summary, [
                'costTotal' => $summary['costTotal'],
                'winTotal' => $summary['winTotal'],
            ]),
        ]);
    }
}
