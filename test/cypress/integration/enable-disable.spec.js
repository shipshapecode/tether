describe('enable-disable test', () => {
  beforeEach(() => {
    cy.visit('/examples/enable-disable/');
  });

  describe('enable/disable works', () => {
    it('enable/disable should apply styles', () => {
      cy.viewport(700, 700);
      // Tether Enabled
      cy.get('.tether-target').should('have.class', 'tether-enabled');
      cy.get('.tether-element').should('have.attr', 'style')
        .should('contain', 'transform: translateX(560px) translateY(479px) translateZ(0px);');
      cy.get('.container').scrollTo(0, 250);
      cy.get('.tether-element').should('have.attr', 'style')
        .should('contain', 'transform: translateX(560px) translateY(229px) translateZ(0px);');

      cy.get('.tether-target').click();

      // Tether Disabled
      cy.get('.tether-target').should('not.have.class', 'tether-enabled');
      cy.get('.tether-element').should('have.attr', 'style')
        .should('contain', 'transform: translateX(560px) translateY(229px) translateZ(0px);');
      cy.get('.container').scrollTo(0, 250);
      cy.get('.tether-element').should('have.attr', 'style')
        .should('contain', 'transform: translateX(560px) translateY(229px) translateZ(0px);');
      cy.get('.container').scrollTo(0, 0);
    });
  });
});
