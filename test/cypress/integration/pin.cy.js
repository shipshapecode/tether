describe('pin', () => {
  beforeEach(() => {
    cy.visit('/examples/pin/');
  });

  describe('tether element pinned', () => {
    it('tether-element should pin on scroll', () => {
      cy.get('.tether-element').should('not.have.class', 'tether-pinned');
      cy.get('.tether-element').should('not.have.class', 'tether-pinned-top');
      cy.scrollTo(0, 300);
      cy.get('.tether-element').should('have.class', 'tether-pinned');
      cy.get('.tether-element').should('have.class', 'tether-pinned-top');
      cy.scrollTo(0, 0);
      cy.get('.tether-element').should('not.have.class', 'tether-pinned');
      cy.get('.tether-element').should('not.have.class', 'tether-pinned-top');
    });

    it('tether-element should pin on resize', () => {
      cy.get('.tether-element').should('not.have.class', 'tether-pinned');
      cy.get('.tether-element').should('not.have.class', 'tether-pinned-right');
      cy.viewport(700, 700);
      cy.get('.tether-element').should('have.class', 'tether-pinned');
      cy.get('.tether-element').should('have.class', 'tether-pinned-right');
      cy.viewport(1500, 700);
      cy.get('.tether-element').should('not.have.class', 'tether-pinned');
      cy.get('.tether-element').should('not.have.class', 'tether-pinned-right');
    });
  });
});
