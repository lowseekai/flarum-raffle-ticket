<?php

namespace Ziven\GuaGuaLe\Controllers;

use Flarum\Api\JsonApiResponse;
use Flarum\Http\RequestUtil;
use Flarum\User\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Arr;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\RequestHandlerInterface;

abstract class AbstractJsonApiController implements RequestHandlerInterface
{
    protected function actor(ServerRequestInterface $request)
    {
        return RequestUtil::getActor($request);
    }

    protected function include(ServerRequestInterface $request, array $defaults = []): array
    {
        $value = Arr::get($request->getQueryParams(), 'include');

        if (! is_string($value) || $value === '') {
            return $defaults;
        }

        return array_values(array_unique(array_filter(array_map('trim', explode(',', $value)))));
    }

    protected function response(
        array $data,
        array $included = [],
        array $meta = [],
        array $links = []
    ): ResponseInterface {
        $document = ['data' => array_values($data)];

        if ($included !== []) {
            $document['included'] = array_values($included);
        }

        if ($meta !== []) {
            $document['meta'] = $meta;
        }

        if ($links !== []) {
            $document['links'] = $links;
        }

        return new JsonApiResponse($document);
    }

    protected function resource(string $type, Model|array $model, array $attributes = [], array $relationships = []): array
    {
        $id = is_array($model) ? ($model['id'] ?? null) : $model->getKey();
        $resource = [
            'type' => $type,
            'id' => (string) $id,
            'attributes' => $attributes,
        ];

        if ($relationships !== []) {
            $resource['relationships'] = $relationships;
        }

        return $resource;
    }

    protected function raffleResource(Model $raffle): array
    {
        return $this->resource('guagualeList', $raffle, [
            'title' => $raffle->title,
            'desc' => $raffle->desc,
            'color' => $raffle->color,
            'image' => $raffle->image,
            'amount' => (int) $raffle->amount,
            'purchased' => (int) $raffle->purchased,
            'settings' => $raffle->settings,
            'cost' => (int) $raffle->cost,
            'limit' => (int) $raffle->limit,
            'activated' => (bool) $raffle->activated,
            'assigned_at' => $raffle->assigned_at?->toDateTimeString(),
        ]);
    }

    protected function userResource(User $user): array
    {
        return $this->resource('users', $user, [
            'username' => $user->username,
            'displayName' => $user->display_name,
            'avatarUrl' => $user->avatar_url,
            'slug' => $user->username,
        ]);
    }

    protected function purchaseResource(
        Model $purchase,
        array $include = [],
        array &$included = []
    ): array {
        $relationships = [];

        if ($purchase->relationLoaded('guagualeData') && $purchase->guagualeData) {
            $raffle = $purchase->guagualeData;
            $relationships['guagualeData'] = [
                'data' => ['type' => 'guagualeList', 'id' => (string) $raffle->getKey()],
            ];

            if (in_array('guagualeData', $include, true)) {
                $this->addIncluded($included, $this->raffleResource($raffle));
            }
        }

        if ($purchase->relationLoaded('purchasedUser') && $purchase->purchasedUser) {
            $user = $purchase->purchasedUser;
            $relationships['purchasedUser'] = [
                'data' => ['type' => 'users', 'id' => (string) $user->getKey()],
            ];

            if (in_array('purchasedUser', $include, true)) {
                $this->addIncluded($included, $this->userResource($user));
            }
        }

        return $this->resource('guagualePurchase', $purchase, [
            'title' => $purchase->title,
            'gua_id' => (int) $purchase->gua_id,
            'user_id' => (int) $purchase->user_id,
            'pruchase_count' => (int) $purchase->pruchase_count,
            'pruchase_cost' => (int) $purchase->pruchase_cost,
            'pruchase_cost_total' => (int) $purchase->pruchase_cost_total,
            'pruchase_win_total' => (int) $purchase->pruchase_win_total,
            'pruchase_result' => $purchase->pruchase_result,
            'opened' => (bool) $purchase->opened,
            'assigned_at' => $purchase->assigned_at?->toDateTimeString(),
            'open_at' => $purchase->open_at?->toDateTimeString(),
        ], $relationships);
    }

    protected function addIncluded(array &$included, array $resource): void
    {
        $key = $resource['type'].':'.$resource['id'];

        foreach ($included as $existing) {
            if ($existing['type'].':'.$existing['id'] === $key) {
                return;
            }
        }

        $included[] = $resource;
    }
}
