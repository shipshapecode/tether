describe('Scroll', () => {
  beforeEach(() => {
    cy.visit('/examples/scroll/', {});
  });

  describe('tether stays near scrollbar', () => {
    it('appears on scroll and stays in fixed position', () => {
      let tetherFixed;
      let tetherOffsetTop;

      cy.get('.tether-target').and(el => {
        // set the initial position coords
        tetherFixed = el.find('.pointer');
        // starting point is 9px from top of document
        tetherOffsetTop = tetherFixed[0].getBoundingClientRect().top - 9;

        expect(el).to.contain('.pointer');
      });
      cy.get('.pointer').should('have.css', 'opacity', '0');

      cy.scrollTo(0, 1500);

      cy.get('.pointer').should('have.css', 'opacity', '1');
      cy.get('.pointer').and(el => {
        const vpOffset = el[0].getBoundingClientRect();
        // we measure from top minus scrolled coords
        expect(vpOffset.top + window.pageYOffset).to.equal(tetherOffsetTop);
      });
    });
  });
});
