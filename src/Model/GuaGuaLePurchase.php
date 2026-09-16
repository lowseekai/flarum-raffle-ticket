<?php

namespace Ziven\GuaGuaLe\Model;

use Flarum\Database\AbstractModel;
use Flarum\Database\ScopeVisibilityTrait;
use Flarum\User\User;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GuaGuaLePurchase extends AbstractModel{
    use ScopeVisibilityTrait;

    protected $table = 'ziven_guaguale_purchase';

    protected $casts = [
        'gua_id' => 'integer',
        'user_id' => 'integer',
        'pruchase_count' => 'integer',
        'pruchase_cost' => 'integer',
        'pruchase_cost_total' => 'integer',
        'pruchase_win_total' => 'integer',
        'opened' => 'boolean',
        'assigned_at' => 'datetime',
        'open_at' => 'datetime',
    ];

    protected $fillable = [
        'title',
        'gua_id',
        'user_id',
        'pruchase_count',
        'pruchase_cost',
        'pruchase_cost_total',
        'pruchase_win_total',
        'pruchase_result',
        'opened',
        'assigned_at',
        'open_at',
    ];

    public function guagualeData(): BelongsTo
    {
        return $this->belongsTo(GuaGuaLe::class, 'gua_id');
    }

    public function purchasedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
