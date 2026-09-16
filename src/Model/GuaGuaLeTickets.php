<?php

namespace Ziven\GuaGuaLe\Model;

use Flarum\Database\AbstractModel;
use Flarum\Database\ScopeVisibilityTrait;

class GuaGuaLeTickets extends AbstractModel{
    use ScopeVisibilityTrait;

    protected $table = 'ziven_guaguale_tickets';

    protected $casts = [
        'gua_id' => 'integer',
        'value' => 'integer',
    ];

    protected $fillable = ['gua_id', 'value', 'flag'];
}
