<?php

namespace Ziven\GuaGuaLe\Controllers;

use Ziven\GuaGuaLe\Model\GuaGuaLe;
use Psr\Http\Message\ServerRequestInterface;

class ListGuaGuaLeController extends AbstractJsonApiController
{
    public function handle(ServerRequestInterface $request): \Psr\Http\Message\ResponseInterface
    {
        $actor = $this->actor($request);

        if (! $actor->can('ziven.zivenAllowGuaGuaLe')) {
            return $this->response([]);
        }

        $raffles = GuaGuaLe::query()
            ->where('activated', true)
            ->orderByDesc('id')
            ->get()
            ->map(fn (GuaGuaLe $raffle) => $this->raffleResource($raffle))
            ->all();

        return $this->response($raffles);
    }
}
