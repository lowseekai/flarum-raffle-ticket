<?php

namespace Ziven\GuaGuaLe\Controllers;

use Ziven\GuaGuaLe\Model\GuaGuaLePurchase;
use Psr\Http\Message\ServerRequestInterface;

class ListGuaGuaLePurchaseHisotryController extends AbstractJsonApiController
{
    public function handle(ServerRequestInterface $request): \Psr\Http\Message\ResponseInterface
    {
        $actor = $this->actor($request);

        if (! $actor->can('ziven.zivenAllowGuaGuaLe')) {
            return $this->response([]);
        }

        $params = $request->getQueryParams();
        $include = $this->include($request, ['guagualeData']);
        $page = is_array($params['page'] ?? null) ? $params['page'] : [];
        $limit = min(max((int) ($page['limit'] ?? $params['limit'] ?? 20), 1), 50);
        $offset = max((int) ($page['offset'] ?? $params['offset'] ?? 0), 0);
        $query = GuaGuaLePurchase::query()
            ->where('user_id', $actor->id)
            ->with(array_intersect($include, ['purchasedUser', 'guagualeData']))
            ->orderByDesc('id');
        $purchases = $query
            ->skip($offset)
            ->take($limit + 1)
            ->get();
        $hasMore = $purchases->count() > $limit;
        if ($hasMore) {
            $purchases->pop();
        }

        $included = [];
        $data = $purchases
            ->map(fn (GuaGuaLePurchase $purchase) => $this->purchaseResource($purchase, $include, $included))
            ->all();

        $queryParams = $params;
        $queryParams['page'] = [
            ...$page,
            'offset' => $offset + $limit,
            'limit' => $limit,
        ];
        $next = '/api/guagualePurchaseHistory?'.http_build_query($queryParams);

        return $this->response(
            $data,
            $included,
            ['page' => ['offset' => $offset, 'limit' => $limit, 'hasMore' => $hasMore]],
            $hasMore ? ['next' => $next] : []
        );
    }
}
