{capture assign="pageTitle"}
    {translate key="plugins.generic.demographicData.questionnairePage.responses.title"}
{/capture}

<link rel="stylesheet" type="text/css" href="/plugins/generic/demographicData/styles/questionnairePage.css">
{include file="frontend/components/header.tpl" pageTitleTranslated=$pageTitle}

<div class="page">
    <h1>{$pageTitle|escape}</h1>

    <p>
        {translate key="plugins.generic.demographicData.questionnairePage.responsesFor.{$authorExternalType}" externalId=$authorExternalId}
    </p>

    <fieldset class="fields">
        {foreach $questions as $question}
            <div class="authorResponse">
                <span class="questionTitle">{$question['title']}</span>
                <span class="responseValue">{$responses[$question['questionId']]}</span>
            </div>
        {/foreach}
    </fieldset>

    <p>{translate key="plugins.generic.demographicData.questionnairePage.checkAnswersAnytime"}</p>
    <p>
        {translate key="plugins.generic.demographicData.questionnairePage.dataMigration.{$authorExternalType}" externalId=$authorExternalId}
    </p>

    <a id="deleteDemographicData" href="{url op="deleteData" authorId=$authorId authorToken=$authorToken}">
        {translate key="plugins.generic.demographicData.questionnairePage.deleteMyData"}
    </a>
</div>

{include file="frontend/components/footer.tpl"}