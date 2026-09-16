<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Schema\Builder;

return [
    'up' => function (Builder $schema) {
        if ($schema->hasTable('ziven_guaguale_purchase') && $schema->hasColumn('ziven_guaguale_purchase', 'open_at')) {
            $schema->table('ziven_guaguale_purchase', function (Blueprint $table) {
                $table->dateTime('open_at')->nullable()->change();
            });
        }

        if ($schema->hasTable('ziven_guaguale_tickets') && $schema->hasColumn('ziven_guaguale_tickets', 'flag')) {
            $schema->table('ziven_guaguale_tickets', function (Blueprint $table) {
                $table->string('flag', 255)->nullable()->default('')->change();
            });
        }
    },
    'down' => function (Builder $schema) {
    },
];
