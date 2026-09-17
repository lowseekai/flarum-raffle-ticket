<?php

declare(strict_types=1);

namespace Ziven\GuaGuaLe\Api\Resource;

use Flarum\Api\Resource\AbstractDatabaseResource;
use Flarum\Api\Schema;
use Ziven\GuaGuaLe\Model\GuaGuaLePurchase;

/**
 * The purchase record is used as the subject of raffle notifications.
 *
 * This resource intentionally exposes no endpoints. It only gives Flarum's
 * notification resource a stable JSON:API type for the polymorphic subject.
 */
final class GuaGuaLePurchaseResource extends AbstractDatabaseResource
{
    public function type(): string
    {
        return 'guagualePurchase';
    }

    public function model(): string
    {
        return GuaGuaLePurchase::class;
    }

    public function fields(): array
    {
        return [
            Schema\Str::make('title'),
            Schema\Integer::make('guaId')
                ->property('gua_id'),
            Schema\Integer::make('userId')
                ->property('user_id'),
            Schema\Integer::make('pruchaseCount')
                ->property('pruchase_count'),
            Schema\Integer::make('pruchaseCost')
                ->property('pruchase_cost'),
            Schema\Integer::make('pruchaseCostTotal')
                ->property('pruchase_cost_total'),
            Schema\Integer::make('pruchaseWinTotal')
                ->property('pruchase_win_total'),
            Schema\Str::make('pruchaseResult')
                ->property('pruchase_result'),
            Schema\Boolean::make('opened'),
            Schema\DateTime::make('assignedAt')
                ->property('assigned_at'),
            Schema\DateTime::make('openAt')
                ->property('open_at'),
        ];
    }
}
