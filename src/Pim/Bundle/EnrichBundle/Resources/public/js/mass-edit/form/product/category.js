'use strict';
/**
 * Change status operation
 *
 * @author    Julien Sanchez <julien@akeneo.com>
 * @copyright 2017 Akeneo SAS (http://www.akeneo.com)
 * @license   http://opensource.org/licenses/osl-3.0.php  Open Software License (OSL 3.0)
 */
define(
    [
        'underscore',
        'oro/translator',
        'pim/i18n',
        'pim/user-context',
        'pim/fetcher-registry',
        'pim/mass-edit-form/product/operation',
        'pim/tree/associate',
        'pim/template/mass-edit/product/category'
    ],
    function (
        _,
        __,
        i18n,
        UserContext,
        FetcherRegistry,
        BaseOperation,
        TreeAssociate,
        template
    ) {
        return BaseOperation.extend({
            template: _.template(template),
            events: {},
            currentTree: null,
            categoryCache: {},
            selectedCategories: [],
            treePromise: null,
            view: null,
            events: {
                'click .nav-tabs .tree-selector': 'changeTree',
                'change #hidden-tree-input': 'updateModel'
            },

            reset: function () {
                this.setValue([]);

                this.treePromise        = null;
                this.currentTree        = null;
                this.selectedCategories = [];
            },

            render: function () {
                if (null === this.treePromise) {
                    FetcherRegistry.getFetcher('category').clear();
                    this.treePromise = FetcherRegistry.getFetcher('category').fetchAll().then(function (trees) {
                        if (null === this.currentTree) {
                            this.currentTree = _.first(trees).code;
                        }

                        this.$el.html(this.template({
                            i18n: i18n,
                            locale: UserContext.get('uiLocale'),
                            trees: trees,
                            currentTree: _.findWhere(trees, {code: this.currentTree}),
                            selectedCategories: this.selectedCategories
                        }));

                        this.delegateEvents();

                        return {
                            treeAssociate: new TreeAssociate('#trees', '#hidden-tree-input', {
                                list_categories: this.config.listRoute,
                                children:        this.config.childrenRoute
                            }),
                            trees: trees
                        };
                    }.bind(this));
                }

                this.delegateEvents();

                return this;
            },

            updateModel: function (event) {
                this.selectedCategories = event.target.value.split(',');
                this.setValue(_.map(this.selectedCategories, this.getCategoryCode.bind(this)));
            },

            setValue: function (categories) {
                var data = this.getFormData();

                data.actions = [{
                    field: 'categories',
                    value: categories
                }];

                this.setData(data);
            },

            getValue: function () {
                var action = _.findWhere(this.getFormData().actions, {field: 'categories'})

                return action ? action.value : null;
            },

            changeTree: function (event) {
                this.currentTree = event.currentTarget.dataset.tree;

                this.treePromise.then(function (elements) {
                    var tree = _.findWhere(elements.trees, {code: this.currentTree});

                    elements.treeAssociate.switchTree(tree.id);

                    this.delegateEvents();
                }.bind(this));
            },

            /**
             * Fetch category code from cache
             *
             * @param {integer} id
             *
             * @returns {string}
             */
            getCategoryCode: function (id) {
                if (!this.categoryCache[id]) {
                    var $categoryElement = this.$('#node_' + id);
                    var $rootElement     = $categoryElement.closest('.root-unselectable');
                    this.categoryCache[id] = {
                        code: String($categoryElement.data('code')),
                        rootId: $rootElement.data('tree-id')
                    };
                }

                return this.categoryCache[id].code;
            },
        });
    }
);
