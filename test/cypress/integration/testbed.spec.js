describe('testbed', () => {
  beforeEach(() => {
    cy.visit('/examples/testbed/');
  });

  describe('flip works', () => {
    it('tether-element should flip on scroll', () => {
      cy.get('.tether-element').should('have.class', 'tether-target-attached-top');
      cy.get('.tether-element').should('not.have.class', 'tether-target-attached-bottom');
      cy.get('.container').scrollTo(0, 250);
      cy.get('.tether-element').should('have.class', 'tether-target-attached-bottom');
      cy.get('.tether-element').should('not.have.class', 'tether-target-attached-top');
    });
  });
});
