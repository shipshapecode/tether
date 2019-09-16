describe('enable-disable test', () => {
  describe('enable/disable works', () => {
    it('tether-element should flip on resize', async () => {
      await cy.visit('/examples/enable-disable/');

      // Tether Enabled
      cy.get('.tether-target').should('have.class', 'tether-enabled');
      cy.get('.tether-element').should('have.css', 'transform', 'matrix(1, 0, 0, 1, 710, 479)');
      await cy.get('.container').scrollTo(0, 169);
      // TODO figure out why this transform does not change
      cy.get('.tether-element').should('have.css', 'transform', 'matrix(1, 0, 0, 1, 710, 479)');
      await cy.get('.container').scrollTo(0, 0);

      await cy.get('.tether-target').click();

      // Tether Disabled
      cy.get('.tether-target').should('not.have.class', 'tether-enabled');
      cy.get('.tether-element').should('have.css', 'transform', 'matrix(1, 0, 0, 1, 710, 229)');
      await cy.get('.container').scrollTo(0, 169);
      cy.get('.tether-element').should('have.css', 'transform', 'matrix(1, 0, 0, 1, 710, 229)');
      await cy.get('.container').scrollTo(0, 0);
    });
  });
});
