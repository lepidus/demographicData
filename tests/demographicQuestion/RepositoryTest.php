<?php

namespace APP\plugins\generic\demographicData\tests\demographicQuestion;

use APP\plugins\generic\demographicData\classes\demographicQuestion\DemographicQuestion;
use APP\plugins\generic\demographicData\classes\demographicQuestion\Repository;
use PKP\tests\DatabaseTestCase;
use APP\plugins\generic\demographicData\tests\helpers\TestHelperTrait;

class RepositoryTest extends DatabaseTestCase
{
    use TestHelperTrait;

    private $contextId;
    private $locale;
    private array $params;

    protected function getAffectedTables(): array
    {
        return [
            ...parent::getAffectedTables(),
            'demographic_questions',
            'demographic_question_settings'
        ];
    }

    protected function setUp(): void
    {
        parent::setUp();
        $this->contextId = $this->createJournalMock();
        $this->locale = "en";
        $this->params = [
            'contextId' => $this->contextId,
            'questionText' => [
                $this->locale => 'Test text'
            ],
            'questionDescription' => [
                $this->locale => 'Test description'
            ]
        ];
        $this->addSchemaFile('demographicQuestion');
    }

    public function testGetNewCustomQuestionObject(): void
    {
        $repository = app(Repository::class);
        $demographicQuestion = $repository->newDataObject();
        self::assertInstanceOf(DemographicQuestion::class, $demographicQuestion);
        $demographicQuestion = $repository->newDataObject($this->params);
        self::assertEquals($this->params, $demographicQuestion->_data);
    }

    public function testCrud(): void
    {
        $repository = app(Repository::class);
        $demographicQuestion = $repository->newDataObject($this->params);
        $insertedDemographicQuestionId = $repository->add($demographicQuestion);
        $this->params['id'] = $insertedDemographicQuestionId;

        $fetchedDemographicQuestion = $repository->get($insertedDemographicQuestionId, $this->contextId);
        self::assertEquals($this->params, $fetchedDemographicQuestion->_data);

        $this->params['questionText']['en'] = 'Updated text';
        $this->params['questionDescription']['en'] = 'Updated description';
        $repository->edit($demographicQuestion, $this->params);

        $fetchedDemographicQuestion = $repository->get($demographicQuestion->getId(), $this->contextId);
        self::assertEquals($this->params, $fetchedDemographicQuestion->_data);

        $repository->delete($demographicQuestion);
        self::assertFalse($repository->exists($demographicQuestion->getId()));
    }

    public function testCollectorFilterByContextId(): void
    {
        $repository = app(Repository::class);
        $demographicQuestion = $repository->newDataObject($this->params);

        $repository->add($demographicQuestion);

        $demographicQuestions = $repository->getCollector()
            ->filterByContextIds([$this->contextId])
            ->getMany();
        self::assertTrue(in_array($demographicQuestion, $demographicQuestions->all()));
    }
}