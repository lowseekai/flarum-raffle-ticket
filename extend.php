<?php

use Flarum\Extend;
use Flarum\Api\Context;
use Flarum\Api\Resource\ForumResource;
use Flarum\Api\Schema;

use Ziven\GuaGuaLe\Controllers\GuaGuaLeIndexController;
use Ziven\GuaGuaLe\Controllers\GuaGuaLeHistoryController;
use Ziven\GuaGuaLe\Controllers\ListGuaGuaLeController;
use Ziven\GuaGuaLe\Controllers\GuaGuaLePurchaseController;
use Ziven\GuaGuaLe\Controllers\GuaGuaLePurchaseListController;
use Ziven\GuaGuaLe\Controllers\GuaGuaLePurchaseCountController;
use Ziven\GuaGuaLe\Controllers\ListGuaGuaLePurchaseHisotryController;
use Ziven\GuaGuaLe\Controllers\GuaGuaLePurchaseHistorySummaryController;
use Ziven\GuaGuaLe\Controllers\GuaGuaLePurchaseUpdateController;
use Ziven\GuaGuaLe\Controllers\GuaGuaLeUpdateController;
use Ziven\GuaGuaLe\Controllers\GuaGuaLeAddController;

use Ziven\GuaGuaLe\Model\GuaGuaLePurchase;
use Ziven\GuaGuaLe\Model\GuaGuaLe;
use Ziven\GuaGuaLe\Notification\GuaGuaLeBlueprint;

$extend = [
    (new Extend\Frontend('admin'))
        ->js(__DIR__.'/js/dist/admin.js')
        ->css(__DIR__.'/less/admin.less'),
    (new Extend\Frontend('forum'))->js(__DIR__ . '/js/dist/forum-fix.js')
        ->js(__DIR__ . '/js/dist/forum.js')->css(__DIR__.'/less/forum.less')
        ->route('/guaguale', 'guaguale.index', GuaGuaLeIndexController::class),

    (new Extend\Locales(__DIR__ . '/locale')),

    (new Extend\Routes('api'))
        ->get('/guagualeList', 'guaguale.get', ListGuaGuaLeController::class)
        ->post('/guagualeList', 'guaguale.add', GuaGuaLeAddController::class)
        ->get('/guagualePurchaseCount', 'guaguale.purchaseCount',GuaGuaLePurchaseCountController::class)
        ->get('/guagualePurchaseList', 'guaguale.details',GuaGuaLePurchaseListController::class)
        ->post('/guagualePurchase', 'guaguale.purchase', GuaGuaLePurchaseController::class)
        ->patch('/guagualeList/{id}', 'guaguale.update', GuaGuaLeUpdateController::class)
        ->patch('/guagualePurchase/{purchase_id}', 'guagualePurchase.update', GuaGuaLePurchaseUpdateController::class)
        ->get('/guagualePurchaseHistory', 'guaguale.history', ListGuaGuaLePurchaseHisotryController::class)
        ->get('/guagualePurchaseHistorySummary', 'guaguale.summary', GuaGuaLePurchaseHistorySummaryController::class),
    (new Extend\Settings())
        ->serializeToForum('guagualeDisplayName', 'ziven-guaguale.guagualeDisplayName', 'strval')
        ->serializeToForum('guagualeTimeZone', 'ziven-guaguale.guagualeTimezone')
        ->serializeToForum('pointSystem.currency_name', 'point-system.currency_name', 'strval')
        ->default('ziven-guaguale.guagualeDisplayName', 'Raffle Ticket')
        ->default('ziven-guaguale.guagualeTimezone', 'Asia/Shanghai'),
    (new Extend\Notification())
        ->type(GuaGuaLeBlueprint::class, ['alert']),

    (new Extend\ApiResource(ForumResource::class))
        ->fields(fn () => [
            Schema\Boolean::make('zivenAllowGuaGuaLe')
                ->get(fn ($forum, Context $context) => $context->getActor()->hasPermission('ziven.zivenAllowGuaGuaLe')),
        ]),
];

return $extend;
