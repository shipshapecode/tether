describe('simple test', () => {
  // let Tether;

  beforeEach(() => {
    // Tether = null;

    cy.visit('/examples/simple/', {
      // onLoad(contentWindow) {
      //   if (contentWindow.Tether) {
      //     return Tether = contentWindow.Tether;
      //   }
      // }
    });
  });

  describe('flip works', () => {
    it('tether-element should flip on resize', () => {
      cy.get('.tether-element').should('have.class', 'tether-target-attached-right');
      cy.get('.tether-element').should('not.have.class', 'tether-target-attached-left');
      cy.viewport(700, 700);
      cy.get('.tether-element').should('have.class', 'tether-target-attached-left');
      cy.get('.tether-element').should('not.have.class', 'tether-target-attached-right');
    });
  });
});
