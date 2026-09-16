<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Schema\Builder;

return [
    'up' => function (Builder $schema) {
        $schema->table('ziven_guaguale_tickets', function (Blueprint $table) {
            $table->float('value')->default(0)->change();
        });
    },
    'down' => function (Builder $schema) {
    },
];
