describe('content-visible', () => {
  beforeEach(() => {
    cy.visit('/examples/content-visible/');
    cy.scrollTo(0, 0);
  });

  describe('enable/disable works', () => {
    it('scrolling moves the element', () => {
      cy.get('.tether-target').should('have.class', 'tether-enabled');
      cy.get('.tether-element').then((tetherElement) => {
        const prescrollTransform = tetherElement[0].style.transform;

        cy.scrollTo(0, 1000);
        cy.wait(500);
        cy.get('.tether-element').then((tetherElement) => {
          const postscrollTransform = tetherElement[0].style.transform;
          expect(prescrollTransform).to.not.equal(postscrollTransform);
        });
      });
    });
  });
});
