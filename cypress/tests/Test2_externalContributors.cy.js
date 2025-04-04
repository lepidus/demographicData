import '../support/commands.js';

function assertDefaultQuestionsDisplay(authorEmail) {
    cy.contains('The demographic data from this questionnaire will be associated with the e-mail address: ' + authorEmail);

    cy.contains('.questionTitle', 'Gender');
    cy.contains('.questionDescription', 'With which gender do you most identify? Please select one option:');
    cy.contains('label', 'Woman');
    cy.contains('label', 'Man');
    cy.contains('label', 'Non-binary or gender diverse');
    cy.contains('label', 'Prefer not to disclose');

    cy.contains('.questionTitle', 'Race');
    cy.contains('.questionDescription', 'How would you identify yourself in terms of race? Please select ALL the groups that apply to you:');
    cy.contains('label', 'Asian or Pacific Islander');
    cy.contains('label', 'Black');
    cy.contains('label', 'Hispanic or Latino/a/x');
    cy.contains('label', 'Indigenous (e.g. North American Indian Navajo, South American Indian Quechua, Aboriginal or Torres Strait Islander)');
    cy.contains('label', 'Middle Eastern or North African');
    cy.contains('label', 'White');
    cy.contains('label', 'Prefer not to disclose');
    cy.contains('label', 'Self describe');

    cy.contains('.questionTitle', 'Ethnicity');
    cy.contains('.questionDescription', "What are your ethnic origins or ancestry? Please select ALL the geographic areas from which your family's ancestors first originated:");
    cy.contains('label', 'Western Europe');
    cy.contains('label', 'Eastern Europe');
    cy.contains('label', 'North Africa');
    cy.contains('label', 'Sub-Saharan Africa');
    cy.contains('label', 'West Asia / Middle East');
    cy.contains('label', 'South and Southeast Asia');
    cy.contains('label', 'East and Central Asia');
    cy.contains('label', 'Pacific / Oceania');
    cy.contains('label', 'North America');
    cy.contains('label', 'Central America and Caribbean');
    cy.contains('label', 'South America');
    cy.contains('label', 'Prefer not to disclose');
    cy.contains('label', 'Self describe');

    cy.contains('Demographic data is collected in accordance with this journal\'s privacy statement');
}

function answerDefaultQuestions() {
    cy.contains('label', 'Woman').within(() => {
        cy.get('input').check();
    });
    cy.contains('label', 'Black').within(() => {
        cy.get('input').check();
    });
    cy.contains('label', 'South America').within(() => {
        cy.get('input').check();
    });

    cy.contains('button', 'Save').click();
}

function assertResponsesOfExternalAuthor(authorEmail) {
    cy.contains('Showing demographic data associated with the e-mail address: ' + authorEmail);

    cy.contains('Woman');
    cy.contains('Black');
    cy.contains('South America');

    cy.contains('You can check you demographic data at any time by visiting this same address');
    cy.contains('By creating a new account in the system with this same e-mail address, your demographic data will automatically be associated with the new account');
}

function assertResponsesOfRegisteredUser() {
    cy.contains('a', 'Demographic Data').click();
    cy.get('input[name="demographicDataConsent"][value=1]').should('be.checked');
    
    cy.contains('label', 'Woman').within(() => {
        cy.get('input').should('be.checked');
    });
    cy.contains('label', 'Black').within(() => {
        cy.get('input').should('be.checked');
    });
    cy.contains('label', 'South America').within(() => {
        cy.get('input').should('be.checked');
    });
}

function beginSubmission(submissionData) {
    cy.get('input[name="locale"][value="en"]').click();
    cy.setTinyMceContent('startSubmission-title-control', submissionData.title);
    
    if (Cypress.env('contextTitles').en !== 'Public Knowledge Preprint Server') {
        cy.get('input[name="sectionId"][value="1"]').click();
    }
    
    cy.get('input[name="submissionRequirements"]').check();
    cy.get('input[name="privacyConsent"]').check();
    cy.contains('button', 'Begin Submission').click();
}

function detailsStep(submissionData) {
    cy.setTinyMceContent('titleAbstract-abstract-control-en', submissionData.abstract);
    submissionData.keywords.forEach(keyword => {
        cy.get('#titleAbstract-keywords-control-en').type(keyword, {delay: 0});
        cy.wait(500);
        cy.get('#titleAbstract-keywords-control-en').type('{enter}', {delay: 0});
    });
    cy.contains('button', 'Continue').click();
}

function contributorsStep(submissionData) {
    submissionData.contributors.forEach(authorData => {
        cy.contains('button', 'Add Contributor').click();
        cy.get('input[name="givenName-en"]').type(authorData.given, {delay: 0});
        cy.get('input[name="familyName-en"]').type(authorData.family, {delay: 0});
        cy.get('input[name="email"]').type(authorData.email, {delay: 0});
        cy.get('select[name="country"]').select(authorData.country);
        
        cy.get('.modal__panel:contains("Add Contributor")').find('button').contains('Save').click();
        cy.waitJQuery();
    });

    cy.contains('button', 'Continue').click();
}

describe('Demographic Data - External contributors data collecting', function() {
    let firstSubmissionData;
    let secondSubmissionData;
    
    before(function() {
        firstSubmissionData = {
            title: "Test scenarios to automobile vehicles",
			abstract: 'Description of test scenarios for cars, motorcycles and other vehicles',
			keywords: ['plugin', 'testing'],
            contributors: [
                {
                    'given': 'Susanna',
                    'family': 'Almeida',
                    'email': 'susy.almeida@outlook.com',
                    'country': 'Brazil'
                }
            ]
		};

        secondSubmissionData = {
            title: "Advancements in tests of automobile vehicles",
			abstract: 'New improvements on tests of cars, motorcycles and other vehicles',
			keywords: ['plugin', 'testing'],
            contributors: [
                {
                    'given': 'Susanna',
                    'family': 'Almeida',
                    'email': 'susy.almeida@outlook.com',
                    'country': 'Brazil'
                }
            ]
		};
    });

    it('Creation of new submission', function() {
        cy.login('ckwantes', null, 'publicknowledge');
        
        cy.contains('a', 'Demographic Data').click();
        cy.get('input[name="demographicDataConsent"][value=0]').click();
        cy.get('#demographicDataForm .submitFormButton').click();
        cy.wait(1000);
        cy.contains('Back to Submissions').click();

        cy.get('div#myQueue a:contains("New Submission")').click();
        beginSubmission(firstSubmissionData);
        detailsStep(firstSubmissionData);
        cy.uploadSubmissionFiles([{
			'file': 'dummy.pdf',
			'fileName': 'dummy.pdf',
			'mimeType': 'application/pdf',
			'genre': 'Article Text'
		}]);
        cy.contains('button', 'Continue').click();
        contributorsStep(firstSubmissionData);
        cy.contains('button', 'Continue').click();
        cy.wait(1000);

        cy.contains('button', 'Submit').click();
        cy.get('.modal__panel:visible').within(() => {
            cy.contains('button', 'Submit').click();
        });
        cy.waitJQuery();
        cy.contains('h1', 'Submission complete');
    });
    it('Editor accepts submission', function () {
        cy.login('dbarnes', null, 'publicknowledge');
        cy.findSubmission('myQueue', firstSubmissionData.title);

        cy.get('#workflow-button').click();
            
        cy.clickDecision('Send for Review');
        cy.contains('button', 'Skip this email').click();
        cy.contains('button', 'Record Decision').click();
        cy.get('a.pkpButton').contains('View Submission').click();
        cy.assignReviewer('Julie Janssen');
        
        cy.clickDecision('Accept Submission');
        cy.recordDecisionAcceptSubmission(['Catherine Kwantes'], [], []);
    });
    it('Access email to collect data from contributors without registration', function () {
        cy.visit('localhost:8025');
        
        cy.get('b:contains("Request for demographic data collection")').should('have.length', 1);
        cy.contains('b', 'Request for demographic data collection')
            .parent().parent().parent()
            .within((node) => {
                cy.contains('susy.almeida@outlook.com');
            });
        cy.get('b:contains("Request for demographic data collection")').click();

        cy.get('#nav-tab button:contains("Text")').click();

        cy.contains('In order to improve our publication, we collect demographic data from the authors of our submissions through an online questionnaire');
        cy.contains('If you do not wish to register, we recommend that you access the following address:');
        cy.contains("If you don't have an ORCID record, you can fill in the questionnaire at the following address:");
        cy.get('.text-view').within(() => {
            cy.get('a').eq(1).should('have.attr', 'href').then((href) => {
                cy.visit(href);
            });
        });

        assertDefaultQuestionsDisplay('susy.almeida@outlook.com');

        cy.url().then(url => {
            cy.visit(url + 'breakToken');
        });
        cy.contains('Demographic Questionnaire');
        cy.contains('Only the author can access this page');
    });
    it('Contributor without registration answers demographic questionnaire', function () {
        cy.visit('localhost:8025');
        cy.get('b:contains("Request for demographic data collection")').click();

        cy.get('#nav-tab button:contains("Text")').click();
        cy.get('.text-view').within(() => {
            cy.get('a').eq(1).should('have.attr', 'href').then((href) => {
                cy.visit(href);
            });
        });

        answerDefaultQuestions();

        cy.contains('Thanks for answering our demographic questionnaire');
        cy.contains('a', 'Check my answers').click();

        assertResponsesOfExternalAuthor('susy.almeida@outlook.com');
    });
    it('New submission is created and accepted with same contributor', function () {
        cy.login('ckwantes', null, 'publicknowledge');
        
        cy.get('div#myQueue a:contains("New Submission")').click();
        beginSubmission(secondSubmissionData);
        detailsStep(secondSubmissionData);
        cy.uploadSubmissionFiles([{
			'file': 'dummy.pdf',
			'fileName': 'dummy.pdf',
			'mimeType': 'application/pdf',
			'genre': 'Article Text'
		}]);
        cy.contains('button', 'Continue').click();
        contributorsStep(secondSubmissionData);
        cy.contains('button', 'Continue').click();
        cy.wait(1000);

        cy.contains('button', 'Submit').click();
        cy.get('.modal__panel:visible').within(() => {
            cy.contains('button', 'Submit').click();
        });
        cy.waitJQuery();
        cy.contains('h1', 'Submission complete');
        cy.logout();

        cy.login('dbarnes', null, 'publicknowledge');
        cy.findSubmission('myQueue', secondSubmissionData.title);

        cy.get('#workflow-button').click();

        cy.clickDecision('Send for Review');
        cy.contains('button', 'Skip this email').click();
        cy.contains('button', 'Record Decision').click();
        cy.get('a.pkpButton').contains('View Submission').click();
        cy.assignReviewer('Julie Janssen');
        
        cy.clickDecision('Accept Submission');
        cy.recordDecisionAcceptSubmission(['Catherine Kwantes'], [], []);
    });
    it('E-mail for demographic data collection is not sent again', function () {
        cy.visit('localhost:8025');
        cy.get('b:contains("Request for demographic data collection")').should('have.length', 1);
    });
    it('Contributor without registration deletes his own demographic data', function () {
        cy.visit('localhost:8025');
        cy.get('b:contains("Request for demographic data collection")').click();

        cy.get('#nav-tab button:contains("Text")').click();
        cy.get('.text-view').within(() => {
            cy.get('a').eq(1).should('have.attr', 'href').then((href) => {
                cy.visit(href);
            });
        });

        cy.contains('a', 'Delete my demographic data').click();

        cy.contains('Demographic data deletion');
        cy.contains('Are you sure you want to delete your demographic data? This action cannot be undone.');
        cy.contains('Delete my demographic data').click();

        cy.contains('Your demographic data has been deleted');
    });
    it('Editor goes back and accepts submission again', function () {
        cy.login('dbarnes', null, 'publicknowledge');
        cy.findSubmission('myQueue', secondSubmissionData.title);

        cy.get('#workflow-button').click();
        cy.clickDecision('Cancel Copyediting');
        cy.contains('button', 'Skip this email').click();
        cy.contains('button', 'Record Decision').click();
        cy.get('a.pkpButton').contains('View Submission').click();

        cy.clickDecision('Accept Submission');
        cy.recordDecisionAcceptSubmission(['Catherine Kwantes'], [], []);
    });
    it('Contributor answers demographic questionnaire on new submission', function () {
        cy.visit('localhost:8025');
        cy.get('b:contains("Request for demographic data collection")').eq(0).click();

        cy.get('#nav-tab button:contains("Text")').click();
        cy.get('.text-view').within(() => {
            cy.get('a').eq(1).should('have.attr', 'href').then((href) => {
                cy.visit(href);
            });
        });

        answerDefaultQuestions();
        cy.contains('Thanks for answering our demographic questionnaire');
    });
    it('Responses reference is migrated when author registers', function () {
        cy.register({
            'username': 'susyalmeida',
            'givenName': 'Susanna',
            'familyName': 'Almeida',
            'email': 'susy.almeida@outlook.com',
            'affiliation': 'Universidade Federal de Santa Catarina',
            'country': 'Brazil'
        });

        cy.contains('a', 'Edit My Profile').click();
        cy.contains('a', 'Demographic Data').click();

        assertResponsesOfRegisteredUser();
    });
});