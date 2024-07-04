<?php

namespace APP\plugins\generic\demographicData\classes;

use APP\core\Application;
use PKP\facades\Locale;
use APP\plugins\generic\demographicData\classes\facades\Repo;

class DemographicDataService
{
    public function retrieveAllQuestions(int $contextId, bool $shouldRetrieveResponses = false)
    {
        $request = Application::get()->getRequest();
        $questions = array();
        $demographicQuestions = Repo::demographicQuestion()
            ->getCollector()
            ->filterByContextIds([$contextId])
            ->getMany();

        foreach ($demographicQuestions as $demographicQuestion) {
            $questionData = [
                'title' => $demographicQuestion->getLocalizedQuestionText(),
                'description' => $demographicQuestion->getLocalizedQuestionDescription(),
                'questionId' => $demographicQuestion->getId()
            ];

            if ($shouldRetrieveResponses) {
                $user = $request->getUser();
                $response = $this->getUserResponse($user->getId(), $demographicQuestion->getId());
                $questionData['response'] = $response;
            }

            $questions[] = $questionData;
        }
        return $questions;
    }

    private function getUserResponse(int $userId, int $questionId)
    {
        $demographicResponses = Repo::demographicResponse()
            ->getCollector()
            ->filterByQuestionIds([$questionId])
            ->filterByUserIds([$userId])
            ->getMany()
            ->toArray();

        if (empty($demographicResponses)) {
            return null;
        }

        $firstResponse = array_shift($demographicResponses);
        return $firstResponse->getText();
    }

    public function registerUserResponses(int $userId, array $responses)
    {
        foreach ($responses as $question => $responseInput) {
            $questionId = explode("-", $question)[1];
            $demographicResponseCollector = Repo::demographicResponse()
                ->getCollector()
                ->filterByQuestionIds([$questionId])
                ->filterByUserIds([$userId])
                ->getMany();
            $demographicResponse = array_shift($demographicResponseCollector->toArray());
            if ($demographicResponse) {
                Repo::demographicResponse()->edit($demographicResponse, ['responseText' => $responseInput]);
            } else {
                $response = Repo::demographicResponse()->newDataObject();
                $response->setUserId($userId);
                $response->setDemographicQuestionId($questionId);
                $response->setData('responseText', $responseInput);
                Repo::demographicResponse()->add($response);
            }
        }
    }

    public function registerExternalAuthorResponses(string $externalId, string $externalType, array $responses)
    {
        $locale = Locale::getLocale();

        foreach ($responses as $question => $responseInput) {
            $questionId = explode("-", $question)[1];

            $response = Repo::demographicResponse()->newDataObject();
            $response->setDemographicQuestionId($questionId);
            $response->setData('responseText', $responseInput, $locale);
            $response->setExternalId($externalId);
            $response->setExternalType($externalType);

            Repo::demographicResponse()->add($response);
        }
    }

    public function authorAlreadyAnsweredQuestionnaire($author): bool
    {
        $email = $author->getData('email');

        $countAuthorResponses = Repo::demographicResponse()
            ->getCollector()
            ->filterByExternalIds([$email])
            ->filterByExternalTypes(['email'])
            ->getCount();

        return ($countAuthorResponses > 0);
    }
}
