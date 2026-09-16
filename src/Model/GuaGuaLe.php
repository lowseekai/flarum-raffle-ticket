<?php

namespace Ziven\GuaGuaLe\Model;

use Flarum\Database\AbstractModel;
use Flarum\Database\ScopeVisibilityTrait;
use Flarum\User\User;

class GuaGuaLe extends AbstractModel{
    use ScopeVisibilityTrait;

    protected $table = 'ziven_guaguale';

    protected $casts = [
        'amount' => 'integer',
        'purchased' => 'integer',
        'cost' => 'integer',
        'limit' => 'integer',
        'activated' => 'boolean',
        'assigned_at' => 'datetime',
    ];

    protected $fillable = [
        'title',
        'desc',
        'color',
        'image',
        'amount',
        'purchased',
        'settings',
        'cost',
        'limit',
        'activated',
        'assigned_at',
    ];
}
