describe('out of bounds', () => {
  beforeEach(() => {
    cy.visit('/examples/out-of-bounds/');
  });

  describe('tether element hidden', () => {
    it('tether-element should hide when it cannot fit', () => {
      cy.get('.tether-element').should('not.have.class', 'tether-out-of-bounds');
      cy.get('.tether-element').should('not.have.class', 'tether-out-of-bounds-left');
      cy.viewport(500, 500);
      cy.get('.tether-element').should('have.class', 'tether-out-of-bounds');
      cy.get('.tether-element').should('have.class', 'tether-out-of-bounds-left');
    });
  });
});
