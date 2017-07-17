@javascript
Feature: Create variants of family through CSV import
  In order to setup my application
  As an administrator
  I need to be able to import several family variants at once

  Background:
    Given the "catalog_modeling" catalog configuration
    And I am logged in as "Peter"
    And I am on the imports page

  Scenario: I successfully create and use a CSV family variant import
    Given I create a new import
    When I fill in the following information in the popin:
      | Code  | family_variant_import     |
      | Label | CSV family variant import |
      | Job   | CSV family variant import |
    And I press the "Save" button
    Then I should not see the text "There are unsaved changes"
    When I am on the imports page
    And I click on the "CSV family variant import" row
    And I upload and import the file "family_variant.csv"
    And I wait for the "family_variant_import" job to finish
    Then there should be the following family variants:
      | code                    | family   | label-de_DE                   | label-en_US                | label-fr_FR                     | variant-axes_1 | variant-axes_2 | variant-attributes_1                           | variant-attributes_2 |
      | clothing_color_and_size | clothing | Kleidung nach Farbe und Größe | Clothing by color and size | Vêtements par couleur et taille | color          | size           | color,name,image_1,variation_image,composition | size,EAN,sku,weight  |
      | shoes_size              | shoes    | Schuhe nach Größe             | Shoes by size              | Chaussures par taille           | eu_shoes_size  |                | weight                                         |                      |
      | clothing_color_size     | clothing | Kleidung nach Farbe/Größe     | Clothing by color/size     | Vêtements par couleur/taille    | color,size     |                | name,image_1,variation_image,composition       |                      |