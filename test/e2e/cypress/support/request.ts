declare namespace Cypress {
    interface Chainable {
        createNewMaintenanceStep(newStepName: String): void;
        createNewMaintenancePlan(newPlanName: String, planDescription: String): void;
        deleteMaintenanceStep(stepId: any): void;
        deleteMaintenancePlan(planId: any): void;
    }
  }
  
  Cypress.Commands.add('createNewMaintenanceStep', (newStepName: String) => {
    cy.request('POST', Cypress.env('URL') + 'service/maintenance/v1/procedure-steps', 
    {
        "name": newStepName,
        "mandatory": true,
        "skippable": false,
        "type": "description",
        "description": "description_" + newStepName,
        "content": {
          "images": [],
          "documents": []
        },
        "tags": [
          "tag-" + newStepName
        ]
    }).its('body').then(body => { 
      let id = body.data.id
      cy.wrap(id).as('stepId');
    });
    cy.reload();
  });

  Cypress.Commands.add('createNewMaintenancePlan', (newPlanName: String, planDescription: String) => {
    cy.request('POST', Cypress.env('URL') + '/service/maintenance/v1/procedures', 
    {
      "name": newPlanName,
      "description": "description_" + newPlanName,
      "interval": 5,
      "intervalUnit": "hours",
      "assetTypeId": "97a9407c-ce04-4268-83cf-e1da782bcf13",
      "steps": [
        {
          "name": "step_" + newPlanName,
          "mandatory": true,
          "skippable": false,
          "type": "description",
          "description": planDescription,
          "content": {
            "images": [],
            "documents": []
          }
        }
      ]
    })
    .its('body').then(body => { 
      let id = body.data.id
      cy.wrap(id).as('planId');
    });
    cy.reload();
  });

  Cypress.Commands.add('deleteMaintenanceStep', (stepId: any) => { 
    cy.get(stepId).then(val => { 
      cy.request('DELETE', Cypress.env('URL') + 'service/maintenance/v1/procedure-steps/'+ val);
    });
  });

  Cypress.Commands.add('deleteMaintenancePlan', (planId: any) => {
    cy.get(planId).then((id) => {
      cy.request('DELETE', Cypress.env('URL') + '/service/maintenance/v1/procedures/'+ id);
    })
  });