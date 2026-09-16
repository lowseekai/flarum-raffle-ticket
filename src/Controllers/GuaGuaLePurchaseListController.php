<?php

namespace Ziven\GuaGuaLe\Controllers;

use Ziven\GuaGuaLe\Model\GuaGuaLePurchase;
use Psr\Http\Message\ServerRequestInterface;

class GuaGuaLePurchaseListController extends AbstractJsonApiController
{
    public function handle(ServerRequestInterface $request): \Psr\Http\Message\ResponseInterface
    {
        $actor = $this->actor($request);

        if (! $actor->can('ziven.zivenAllowGuaGuaLe')) {
            return $this->response([]);
        }

        $params = $request->getQueryParams();
        $guaId = filter_var($params['guaID'] ?? null, FILTER_VALIDATE_INT);

        if (! $guaId || $guaId < 1) {
            return $this->response([]);
        }

        $include = $this->include($request, ['purchasedUser']);
        $included = [];
        $purchases = GuaGuaLePurchase::query()
            ->where('opened', true)
            ->where('gua_id', $guaId)
            ->with(array_intersect($include, ['purchasedUser', 'guagualeData']))
            ->orderByDesc('open_at')
            ->limit(30)
            ->get()
            ->map(fn (GuaGuaLePurchase $purchase) => $this->purchaseResource($purchase, $include, $included))
            ->all();

        return $this->response($purchases, $included);
    }
}
