<?php

namespace Ziven\GuaGuaLe\Controllers;

use Ziven\GuaGuaLe\Model\GuaGuaLe;
use Ziven\GuaGuaLe\Model\GuaGuaLePurchase;
use Ziven\GuaGuaLe\Model\GuaGuaLeTickets;

use Flarum\User\User;
use Flarum\Foundation\ValidationException;
use Flarum\Locale\Translator;
use Psr\Http\Message\ServerRequestInterface;
use Illuminate\Support\Arr;
use Illuminate\Database\ConnectionInterface;

class GuaGuaLeUpdateController extends AbstractJsonApiController
{
    protected $translator;

    public function __construct(Translator $translator, private ConnectionInterface $db){
        $this->translator = $translator;
    }

    public function handle(ServerRequestInterface $request): \Psr\Http\Message\ResponseInterface
    {
        $actor = $this->actor($request);
        $actor->assertAdmin();
        $guagualeID = Arr::get($request->getQueryParams(), 'id');

        if ($request->getMethod() === 'DELETE') {
            $guagualeData = GuaGuaLe::find($guagualeID);

            if (! $guagualeData) {
                throw new ValidationException([
                    'message' => $this->translator->trans('ziven-guaguale.admin.guaguale-save-error'),
                ]);
            }

            $this->db->transaction(function () use ($guagualeID, $guagualeData): void {
                GuaGuaLeTickets::where('gua_id', $guagualeID)->delete();
                $guagualeData->delete();
            });

            return $this->response([]);
        }

        if(!isset($guagualeID)){
            throw new ValidationException([
                'message' => $this->translator->trans('ziven-guaguale.admin.guaguale-save-error'),
            ]);
        }

        $data = Arr::get($request->getParsedBody(), 'data', []);
        $attributes = Arr::get($data, 'attributes', []);
        $guagualeData = GuaGuaLe::find($guagualeID);

        if (! $guagualeData) {
            throw new ValidationException([
                'message' => $this->translator->trans('ziven-guaguale.admin.guaguale-save-error'),
            ]);
        }

        if (Arr::has($attributes, 'title')) {
            $guagualeData->title = Arr::get($attributes, 'title');
            GuaGuaLePurchase::where('gua_id', $guagualeID)->update(['title' => $guagualeData->title]);
        }
        if (Arr::has($attributes, 'desc')) {
            $guagualeData->desc = Arr::get($attributes, 'desc');
        }
        if (Arr::has($attributes, 'cost')) {
            $guagualeData->cost = Arr::get($attributes, 'cost', 1);
        }
        if (Arr::has($attributes, 'limit')) {
            $guagualeData->limit = Arr::get($attributes, 'limit', 0);
        }
        if (Arr::has($attributes, 'settings')) {
            $guagualeData->settings = Arr::get($attributes, 'settings');
        }
        if (Arr::has($attributes, 'image')) {
            $guagualeData->image = Arr::get($attributes, 'image');
        }
        if (Arr::has($attributes, 'color')) {
            $guagualeData->color = Arr::get($attributes, 'color');
        }
        if (Arr::has($attributes, 'activated')) {
            $activated = (bool) Arr::get($attributes, 'activated', true);
            $guagualeData->activated = $activated;
            if (! $activated) {
                GuaGuaLeTickets::where('gua_id', $guagualeID)->delete();
            }
        }

        $guagualeData->save();

        return $this->response([$this->raffleResource($guagualeData)]);
    }
}
