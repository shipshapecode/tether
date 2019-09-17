describe('enable-disable test', () => {
  beforeEach(() => {
    cy.visit('/examples/enable-disable/');
  });

  describe('enable/disable works', () => {
    it('enable/disable should apply styles', () => {
      const isCI = Cypress.env('CI');
      const x = isCI ? '1157' : '1170';
      const y = isCI ? '228' : '229';
      const enabledY = isCI ? '478' : '479';
      // Tether Enabled
      cy.get('.tether-target').should('have.class', 'tether-enabled');
      cy.get('.tether-element').should('have.attr', 'style')
        .should('contain', `transform: translateX(${x}px) translateY(${enabledY}px) translateZ(0px)`);

      cy.get('.container').scrollTo(0, 250);
      cy.get('.tether-element').should('have.attr', 'style')
        .should('contain', `transform: translateX(${x}px) translateY(${y}px) translateZ(0px)`);
      cy.get('.container').scrollTo(0, 0);

      cy.get('.tether-target').click();

      // Tether Disabled
      cy.get('.tether-target').should('not.have.class', 'tether-enabled');
      cy.get('.tether-element').should('have.attr', 'style')
        .should('contain', `transform: translateX(${x}px) translateY(${y}px) translateZ(0px)`);
      cy.get('.container').scrollTo(0, 250);
      cy.get('.tether-element').should('have.attr', 'style')
        .should('contain', `transform: translateX(${x}px) translateY(${y}px) translateZ(0px)`);
      cy.get('.container').scrollTo(0, 0);
    });
  });
});
