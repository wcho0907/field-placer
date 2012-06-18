/**
 * override grid
 */
(function($){

    $.extend($.fn, {
        /**
         * 取得目前所選取資料行資料
         */
        getSelRowDatas: function(){
            var tGrid = $(this);
            if (tGrid.jqGrid('getGridParam', 'multiselect')) {
                var sels = tGrid.jqGrid('getGridParam', 'selarrrow');
                var res = [];
                for (var i = 0; i < sels.length; i++) {
                    res.push(tGrid.getRowData(sels[i]));
                }
                return res.length ? res : undefined;
            }
            else {
                var selrow = tGrid.jqGrid('getGridParam', 'selrow');
                return selrow ? tGrid.getRowData(selrow) : undefined;
            }
        },
        /**
         * 將GridData轉換為Array<JSON>值
         * @param {boolean} stringify
         */
        serializeGridData: function(stringify){
            var data = [];
            if ($(this).attr('role') == 'grid') {
                var tGrid = $(this);
                tGrid.find('tr[id]').each(function(){
                    data.push($.extend(tGrid.getRowData($(this).attr('id')), {
                        rowId: $(this).attr('id')
                    }));
                });
            }
            return stringify ? JSON.stringify(data) : data;
        },
        /**
         * add data to grid by Array[json,json,....] or Array[array,array,....]
         * @param {Object} datas
         */
        addGridData: function(datas){
            var $this = $(this), ids = $this.getGridParam("colIds");
            
            function _convertJson(d){
                var td = {};
                for (var i in ids) {
                    td[ids[i]] = d[i++];
                }
                return td;
            }
            
            if (datas instanceof Array) {
                for (var data in datas) {
                    var _data = (datas[data] instanceof Array) ? _convertJson(datas[data]) : datas[data], rowId = _data[$this[0].colKey];
                    var _new = !$this[0].rows.namedItem(rowId);
                    $this[_new ? "addRowData" : "setRowData"](rowId, _data);
                }
            }
            return this;
            
        },
        /**
         * Grid hide (extend jQuery hide)
         * @param {integer} speed
         * @param {function} callback
         */
        iGridHide: function(speed, callback){
            $("#gbox_" + $(this).attr("id")).hide(speed, callback);
            return $(this);
        },
        /**
         * Gird show (extend jQuery show)
         * @param {integer} speed
         * @param {function} callback
         */
        iGridShow: function(speed, callback){
            $("#gbox_" + $(this).attr("id")).show(speed, callback);
            return $(this);
        }
    });
    
    //    $.extend($.jgrid.defaults, {
    //        rowNum: 50,
    //        //	scroll: 1,
    //        hidegrid: false,
    //        datatype: "",
    //        height: 100,
    //        rownumbers: true,
    //        mtype: 'POST',
    //        autowidth: true,
    //        forceFit: true
    //    });
    var _jqGrid = $.fn.jqGrid;
    $.fn.jqGrid = function(){
        if (!arguments.length) {
            alert("grid argument error");
            return this;
        }
        
        
        if ((this.is("div") || !this.is("[role=grid]")) && typeof arguments[0] === 'object') {
            var url = arguments[0].url;
            //default settings
            var needPager = !(arguments[0].pager === false);
            var s = $.extend({}, {
                ajaxGridOptions: { // ajax option
                    global: false
                },
                forceFit: true,
                url: '',
                mtype: 'POST',
                rowNum: (needPager == false) ? 1000 : Properties.Grid.rowNum,
                rowList: Properties.Grid.rowList,
                multiselect: false,
                viewrecords: true,
                pgbuttons: needPager,
                pginput: needPager,
                loadonce: false,
                autowidth: true,
                localFirst: false,
                gridview: true
            }, arguments[0]);
            //  console.debug(s);
            var id = this.attr("id");
            this.append($("<table />", {
                id: id
            })).addClass("r-grid").removeAttr("id");
            // add pager
            // arguments[0].pager &&
            this.append($("<div />", {
                id: id + "-pager"
            }));
            $.extend(s, {
                pager: id + "-pager",
                hidegrid: false,
                datatype: (!s.localFirst && url) ? 'json' : 'local',
                url: (!s.localFirst && url) ? url : ''
            });
            
            //add header
            var _colNames = s.colNames || [];
            s.colNames = [];
            for (var col in s.colModel) {
                s.colNames.push(_colNames[col] || s.colModel[col].header || s.colModel[col].name);
            }
            // add columns info
            s = $.extend({}, s, {
                postData: $.extend(s.postData || {}, {
                    _columnParam: JSON.stringify(s.colModel, null),
                    groupCloumn: JSON.stringify(s.groupingView && s.groupingView.groupField || [], null),
                    mtype: "post"
                })
            });
            //            console.debug(s)
            var resGrid = _jqGrid.call(this.is("table") ? this : this.find("table"), s);
            resGrid.navGrid("#" + id + "-pager", {
                del: false,
                add: false,
                edit: false,
                search: false
            });
            
            s.localFirst &&
            resGrid.setGridParam({
                datatype: url ? 'json' : 'local',
                url: url
            });
            
            return resGrid;
        }
        //
        return _jqGrid.apply(this.is("table") ? $(this) : $(this.find("table")), arguments);
    };
    $.extend($.fn.jqGrid, _jqGrid);
})(jQuery);
