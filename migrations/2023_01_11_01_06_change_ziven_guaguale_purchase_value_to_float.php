<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Schema\Builder;

return [
    'up' => function (Builder $schema) {
        $schema->table('ziven_guaguale_purchase', function (Blueprint $table) {
            $table->float('pruchase_win_total')->default(0)->change();
        });
    },
    'down' => function (Builder $schema) {
        
    },
];
