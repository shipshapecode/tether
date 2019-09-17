import { assert } from 'chai';

describe('enable-disable test', () => {
  beforeEach(() => {
    cy.visit('/examples/enable-disable/');
    cy.get('.container').scrollTo(0, 0);
  });

  describe('enable/disable works', () => {
    it('enable should apply transforms', () => {
      cy.get('.tether-target').should('have.class', 'tether-enabled');
      cy.get('.tether-element').then((tetherElement) => {
        const prescrollTransform = tetherElement[0].style.transform;

        cy.get('.container').scrollTo(0, 250);
        cy.wait(500);
        cy.get('.tether-element').then((tetherElement) => {
          const postscrollTransform = tetherElement[0].style.transform;
          assert.notEqual(prescrollTransform, postscrollTransform);
        });
      });
    });

    it('disable should not apply transforms', () => {
      cy.get('.tether-target').click();
      cy.get('.tether-target').should('not.have.class', 'tether-enabled');
      cy.get('.tether-element').then((tetherElement) => {
        const prescrollTransform = tetherElement[0].style.transform;

        cy.get('.container').scrollTo(0, 250);
        cy.wait(500);
        cy.get('.tether-element').then((tetherElement) => {
          const postscrollTransform = tetherElement[0].style.transform;
          assert.equal(prescrollTransform, postscrollTransform);
        });
      });
    });
  });
});
