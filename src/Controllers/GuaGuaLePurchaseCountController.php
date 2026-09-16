<?php

namespace Ziven\GuaGuaLe\Controllers;

use Ziven\GuaGuaLe\Model\GuaGuaLePurchaseCount;
use Psr\Http\Message\ServerRequestInterface;

class GuaGuaLePurchaseCountController extends AbstractJsonApiController
{
    public function handle(ServerRequestInterface $request): \Psr\Http\Message\ResponseInterface
    {
        $actor = $this->actor($request);

        if (! $actor->can('ziven.zivenAllowGuaGuaLe')) {
            return $this->response([]);
        }

        $counts = GuaGuaLePurchaseCount::query()
            ->where('user_id', $actor->id)
            ->get()
            ->map(fn (GuaGuaLePurchaseCount $count) => $this->resource(
                'guagualePurchaseCount',
                ['id' => $count->gua_id],
                [
                    'gua_id' => (int) $count->gua_id,
                    'total_pruchase_count' => (int) $count->total_pruchase_count,
                ]
            ))
            ->all();

        return $this->response($counts);
    }
}
