<?php

namespace Ziven\GuaGuaLe\Model;

use Flarum\Database\AbstractModel;
use Flarum\Database\ScopeVisibilityTrait;

class GuaGuaLePurchaseCount extends AbstractModel{
    use ScopeVisibilityTrait;

    protected $table = 'ziven_guaguale_purchase_count';

    protected $casts = [
        'user_id' => 'integer',
        'gua_id' => 'integer',
        'total_pruchase_count' => 'integer',
    ];

    protected $fillable = ['user_id','gua_id','total_pruchase_count'];
}
