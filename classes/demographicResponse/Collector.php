<?php

namespace APP\plugins\generic\demographicData\classes\demographicResponse;

use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\DB;
use PKP\core\interfaces\CollectorInterface;
use Illuminate\Support\LazyCollection;

class Collector implements CollectorInterface
{
    public DAO $dao;
    public ?array $questionIds = null;
    public ?array $userIds = null;
    public ?array $externalIds = null;
    public ?array $externalTypes = null;

    public function __construct(DAO $dao)
    {
        $this->dao = $dao;
    }

    public function filterByQuestionIds(?array $questionIds): Collector
    {
        $this->questionIds = $questionIds;
        return $this;
    }

    public function filterByUserIds(?array $userIds): Collector
    {
        $this->userIds = $userIds;
        return $this;
    }

    public function filterByExternalIds(?array $externalIds): Collector
    {
        $this->externalIds = $externalIds;
        return $this;
    }

    public function filterByExternalTypes(?array $externalTypes): Collector
    {
        $this->externalTypes = $externalTypes;
        return $this;
    }

    public function getQueryBuilder(): Builder
    {
        $queryBuilder = DB::table($this->dao->table . ' as demographic_responses')
            ->select(['demographic_responses.*']);

        if (isset($this->questionIds)) {
            $queryBuilder->whereIn('demographic_responses.demographic_question_id', $this->questionIds);
        }

        if (isset($this->userIds)) {
            $queryBuilder->whereIn('demographic_responses.user_id', $this->userIds);
        }

        if (isset($this->externalIds)) {
            $queryBuilder->whereIn('demographic_responses.external_id', $this->externalIds);
        }

        if (isset($this->externalTypes)) {
            $queryBuilder->whereIn('demographic_responses.external_type', $this->externalTypes);
        }

        return $queryBuilder;
    }

    public function getCount(): int
    {
        return $this->dao->getCount($this);
    }

    public function getIds(): Collection
    {
        return $this->dao->getIds($this);
    }

    public function getMany(): LazyCollection
    {
        return $this->dao->getMany($this);
    }
}
