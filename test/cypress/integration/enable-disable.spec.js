describe('enable-disable test', () => {
  describe('enable/disable works', () => {
    it('tether-element should flip on resize', async () => {
      await cy.visit('/examples/enable-disable/');

      // Tether Enabled
      await cy.get('.tether-target').should('have.class', 'tether-enabled');
      await cy.get('.tether-element').should('have.attr', 'style')
        .should('contain', 'transform: translateX(710px) translateY(479px) translateZ(0px)');

      await cy.get('.container').scrollTo(0, 250);
      await cy.get('.tether-element').should('have.attr', 'style')
        .should('contain', 'transform: translateX(710px) translateY(229px) translateZ(0px)');
      await cy.get('.container').scrollTo(0, 0);

      await cy.get('.tether-target').click();

      // Tether Disabled
      await cy.get('.tether-target').should('not.have.class', 'tether-enabled');
      await cy.get('.tether-element').should('have.attr', 'style')
        .should('contain', 'transform: translateX(710px) translateY(229px) translateZ(0px)');
      await cy.get('.container').scrollTo(0, 250);
      await cy.get('.tether-element').should('have.attr', 'style')
        .should('contain', 'transform: translateX(710px) translateY(229px) translateZ(0px)');
      await cy.get('.container').scrollTo(0, 0);
    });
  });
});
