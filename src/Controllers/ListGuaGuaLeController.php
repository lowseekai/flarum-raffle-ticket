<?php

namespace Ziven\GuaGuaLe\Controllers;

use Ziven\GuaGuaLe\Model\GuaGuaLe;
use Psr\Http\Message\ServerRequestInterface;
use Illuminate\Support\Arr;

class ListGuaGuaLeController extends AbstractJsonApiController
{
    public function handle(ServerRequestInterface $request): \Psr\Http\Message\ResponseInterface
    {
        $actor = $this->actor($request);
        $includeInactive = filter_var(
            Arr::get($request->getQueryParams(), 'includeInactive', false),
            FILTER_VALIDATE_BOOLEAN
        );

        if ($includeInactive) {
            $actor->assertAdmin();
        } elseif (! $actor->can('ziven.zivenAllowGuaGuaLe')) {
            return $this->response([]);
        }

        $query = GuaGuaLe::query();

        if (! $includeInactive) {
            $query->where('activated', true);
        }

        $raffles = $query
            ->orderByDesc('id')
            ->get()
            ->map(fn (GuaGuaLe $raffle) => $this->raffleResource($raffle))
            ->all();

        return $this->response($raffles);
    }
}
