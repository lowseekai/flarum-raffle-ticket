<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Schema\Builder;

return [
    'up' => function (Builder $schema) {
        if (!$schema->hasTable('ziven_guaguale_purchase')) {
            $schema->create('ziven_guaguale_purchase', function (Blueprint $table) {
                $table->increments('id');
                $table->string('title', 255);
                $table->integer('gua_id')->unsigned();
                $table->integer('user_id')->unsigned();
                $table->integer('pruchase_count')->unsigned();
                $table->float('pruchase_cost')->unsigned();
                $table->float('pruchase_cost_total')->unsigned();
                $table->integer('pruchase_win_total')->unsigned();
                $table->string('pruchase_result', 1000);
                $table->boolean('opened')->default(0);
                $table->dateTime('assigned_at');
                $table->dateTime('open_at')->nullable();

                $table->index('assigned_at');
                $table->index('open_at');
                $table->index('pruchase_cost_total');
                $table->index('pruchase_win_total');
                $table->index('user_id');
                $table->foreign('gua_id')->references('id')->on('ziven_guaguale')->onDelete('cascade');
                $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            });
        }
    },
    'down' => function (Builder $schema) {
        $schema->drop('ziven_guaguale_purchase');
    },
];
