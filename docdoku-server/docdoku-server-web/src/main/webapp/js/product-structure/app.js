var sceneManager;

define(["router","views/search_view", "views/parts_tree_view", "views/bom_view", "views/part_metadata_view", "modules/navbar-module/views/navbar_view","SceneManager"], function (Router,SearchView, PartsTreeView, BomView, PartMetadataView, NavBarView, SceneManager) {

    var AppView = Backbone.View.extend({

        el: $("#content"),

        events: {
            "click #scene_view_btn": "sceneMode",
            "click #bom_view_btn": "bomMode"
        },

        updateBom: function(showRoot) {
            if(showRoot){
                this.bomView.showRoot(this.partsTreeView.componentSelected);
            }else{
                this.bomView.updateContent(this.partsTreeView.componentSelected);
            }
        },

        sceneMode: function() {
            this.inBomMode = false;
            this.bomModeButton.removeClass("active");
            this.sceneModeButton.addClass("active");
            this.bomContainer.hide();
            this.centerSceneContainer.show();
            this.bomView.bomHeaderView.hideCheckGroup();
        },

        bomMode: function() {
            this.inBomMode = true;
            this.sceneModeButton.removeClass("active");
            this.bomModeButton.addClass("active");
            this.centerSceneContainer.hide();
            this.bomContainer.show();
            this.updateBom();
        },

        isInBomMode: function() {
            return this.inBomMode;
        },

        initialize: function() {

            new NavBarView();

            this.sceneModeButton = this.$("#scene_view_btn");
            this.bomModeButton = this.$("#bom_view_btn");
            this.bomContainer = this.$("#bom_table_container");
            this.centerSceneContainer = this.$("#center_container");
            this.partMetadataContainer = this.$("#part_metadata_container");

            this.inBomMode = false;

            this.bomView = new BomView().render();

            sceneManager = new SceneManager();

            var searchView = new SearchView();

            this.partsTreeView = new PartsTreeView({
                resultPathCollection: searchView.collection
            }).render();

            this.partsTreeView.on("component_selected", this.onComponentSelected, this);

            Backbone.Events.on("refresh_tree", this.onRefreshTree, this);

            sceneManager.init();

            $("#product-menu").resizable({
                containment: "#content",
                handles: 'e',
                autoHide: true,
                stop: function(e, ui) {
                    var parent = ui.element.parent();
                    ui.element.css({
                        width: ui.element.width()/parent.width()*100+"%",
                        height: ui.element.height()/parent.height()*100+"%"
                    });
                }
            });

        },

        onComponentSelected: function(showRoot) {
            if (this.isInBomMode()) {
                this.updateBom(showRoot);
            }
            this.showPartMetadata();
            sceneManager.setPathForIframe(this.partsTreeView.componentSelected.getPath());
        },

        onRefreshTree:function(){
            if (this.isInBomMode()) {
                this.updateBom();
            }
            this.partsTreeView.refreshAll();
        },

        onRefreshComponent:function(partKey){
          this.partsTreeView.onRefreshComponent(partKey);
        },

        //TODO better panel for part metadata
        showPartMetadata:function() {
            this.partMetadataContainer.empty();
            new PartMetadataView({model: this.partsTreeView.componentSelected}).render();
            this.partMetadataContainer.show();
        }

    });

    Router.getInstance();
    Backbone.history.start();

    return AppView;
});