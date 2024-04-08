<?php

namespace APP\plugins\generic\demographicData\tests\demographicResponse;

use APP\plugins\generic\demographicData\classes\demographicResponse\DemographicResponse;
use APP\plugins\generic\demographicData\classes\demographicResponse\Repository;
use PKP\tests\DatabaseTestCase;
use APP\plugins\generic\demographicData\tests\helpers\TestHelperTrait;

class RepositoryTest extends DatabaseTestCase
{
    use TestHelperTrait;

    private $params;
    private $demographicQuestionId;
    private $userId;

    protected function getAffectedTables(): array
    {
        return [
            ...parent::getAffectedTables(),
            'demographic_questions',
            'demographic_question_settings',
            'demographic_responses',
            'demographic_response_settings'
        ];
    }

    protected function setUp(): void
    {
        parent::setUp();
        $this->demographicQuestionId = $this->createDemographicQuestion();
        $this->userId = $this->createUserMock();
        $this->params = [
            'demographicQuestionId' => $this->demographicQuestionId,
            'userId' => $this->userId,
            'responseText' => [
                self::DEFAULT_LOCALE => 'Test text'
            ]
        ];
        $this->addSchemaFile('demographicQuestion');
        $this->addSchemaFile('demographicResponse');
    }

    public function testGetNewDemographicResponseObject(): void
    {
        $repository = app(Repository::class);
        $demographicResponse = $repository->newDataObject();
        self::assertInstanceOf(DemographicResponse::class, $demographicResponse);
        $demographicResponse = $repository->newDataObject($this->params);
        self::assertEquals($this->params, $demographicResponse->_data);
    }

    public function testCrud(): void
    {
        $repository = app(Repository::class);
        $demographicResponse = $repository->newDataObject($this->params);
        $insertedDemographicResponseId = $repository->add($demographicResponse);
        $this->params['id'] = $insertedDemographicResponseId;

        $fetchedDemographicResponse = $repository->get($insertedDemographicResponseId, $this->demographicQuestionId);
        self::assertEquals($this->params, $fetchedDemographicResponse->_data);

        $this->params['responseText']['en'] = 'Updated text';
        $repository->edit($demographicResponse, $this->params);

        $fetchedDemographicResponse = $repository->get($demographicResponse->getId(), $this->demographicQuestionId);
        self::assertEquals($this->params, $fetchedDemographicResponse->_data);

        $repository->delete($demographicResponse);
        self::assertFalse($repository->exists($demographicResponse->getId()));
    }
}
