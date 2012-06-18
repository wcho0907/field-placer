// extract report part to jqreport plugin
$(document).ready(function() {
	var mform = $("#mform");
	$("#tabs").tabs();
	
	$('#field-locator').dialog({
		autoOpen: false,
		height: 700,
		width: 980,
		modal: true
	});
	
	var configClosed = "ui-icon-circle-triangle-e";
	var configOpened = "ui-icon-circle-triangle-s";
    var columnPlus = "ui-icon-plusthick";
    var columnMinus = "ui-icon-minusthick";
    var moveImageClass = "ui-icon-arrow-4-diag";

	var selected = $([]), offset = {top:0, left:0};

	//// Retrieve the object from storage (HTML 5)
    var fields;
    try {
        fields = localStorage.getItem('_FormViewer.fields');
    }
    catch (err) {
    	console.log("fail to call localStorage.getItem()");
    }

    if(!fields){

    }

    // 設定頁面邊距
    var marginLeft = 5; // Todo: Lib parament: (5) 預設頁面邊距左距
    var marginTop = 10;  // Todo: Lib parament: (10) 預設頁面邊距頂距

    $('#formImage').css('margin-left', marginLeft).css('margin-top', marginTop);
	$('#formArea').css('margin-left', marginLeft).css('margin-top', marginTop);

	$('#formArea').draggable({
		containment: "#pageFrame",
		handle:"span"});
    var moveImage = $('<span style="float:left;margin-left:5px;margin-top:5px;" class="ui-icon"></span>');
    moveImage.addClass(moveImageClass);
    $('#formArea').append(moveImage);
	
    $('#fvpmLeft').val(marginLeft).keydown(function(e) {
    	// todo: 改回 change()
        if(e.keyCode==13){
            var ml = parseInt($(this).val());
        	if(ml >= 0) {
        		marginLeft = ml;
				$('#formImage').css('margin-left', marginLeft);
				$('#formArea').css('margin-left', marginLeft);
        	}
        }
    });

    $('#fvpmTop').val(marginTop).keydown(function(e) {
    	if(e.keyCode==13){
        	var mt = parseInt($(this).val());
        	if(mt >= 0) {
        		marginTop = mt;
				$('#formImage').css('margin-top', marginTop);
				$('#formArea').css('margin-top', marginTop);
        	}
        }
    });

	// 設定頁面大小
    var pageSize = "A4"; // Todo: Lib parament: (A4) 預設頁面大小 [A3|A4|A5|B3|B4|B5]				
	$("#pageSize").buttonset().find('label').width(50); // Todo: UI parament: (50) 預設頁面大小按鈕大小

	// 設定頁面方向
	var pageOrientation = "P"; // Todo: Lib parament: (P) 預設頁面方向 [P(ortrait)|L(andscape)]
	$("#pageOrientation").buttonset().find('label').width(100); // Todo: UI parament: (100) 預設頁面方向按鈕大小

	$('#pageFrame').addClass('pageSize-' + pageOrientation + '-' + pageSize);

	$("#pageSize label").click(function(e) {
	    var newSize = $(this).children('span').html();
	    var newOrientation = pageOrientation;
		updatePageSetting(newSize, newOrientation);
	});
	$("#pageOrientation label").click(function(e) {
		var newSize = pageSize;
		var newOrientation = $(this).children('span').html();
		updatePageSetting(newSize, newOrientation);
	});	

	var drawMiniature = function(){
		//$('#formArea').clone().appendTo('#miniature');
	};
	
	var updatePageSetting = function(theSize, theOrientation){
		if(theOrientation=='直式' || theOrientation=='P'){
			theOrientation = "P";
		}
		else{
			theOrientation = "L";
		}

		$('#pageFrame').removeClass('pageSize-' + pageOrientation + '-' + pageSize).addClass('pageSize-' + theOrientation + '-' + theSize);
		pageOrientation = theOrientation;
		pageSize = theSize;
	};

	// 產生欄位
	var createField = function(fieldObj){                   
        // 1. 欄位定義初始化    
        
        //   初始[id]
        var thisID = 'id' + fieldObj.id;

        var divObj = $("<div id='" + thisID + "' class='fvField fv-opacity'></div>");

        //   加入[key]
        divObj.addClass(fieldObj.fkey);

        //   初始[fname]
        $(divObj).append(fieldObj.fname);

        //   初始[flocation: left,top,subitems,interval]
        var fLeft = fieldObj.flocation.split(",")[0];
        var fTop = fieldObj.flocation.split(",")[1];

        if(!fTop){
        	fTop = (parseInt(fieldObj.id) -1) * 35;  // Todo: Lib parament: (35) 預設 element 之間的間距
        	fLeft = 0;
        }
        else{
        	fLeft = parseInt(fLeft);
            fTop = parseInt(fTop);
        }

        divObj.css("left", fLeft);                      
        divObj.css("top", fTop);  

		if(fieldObj.ftype=='多重'){
			var fsubitems = fieldObj.flocation.split(",")[2];
			var ftopinterval = fieldObj.flocation.split(",")[3];                        
            // Todo: Lib parament: (30) 預設 subitem 之間的間距 
            if(!ftopinterval){
            	divObj.data("topInterval",30);
            }
            else{
            	divObj.data("topInterval",ftopinterval);	
            }
            // Todo: Lib parament: (0) 預設 subitem 的個數
            divObj.data("nextSubItems",0);
		}

        //   初始[ftalign] 
        var ftalign =  fieldObj.ftalign;
		if(!ftalign){
        	divObj.data("ftalign", '置左');  // Todo: Lib parament: ('置左') 預設 文字對齊方式 置左/置中/置右
        }
        else{
        	divObj.data("ftalign", ftalign);	
        } 

        //   初始[fwidth]
		var fwidth = fieldObj.fwidth;
		if(!fwidth){
        	divObj.css("width", 140);  // Todo: Lib parament: (140) 預設 欄位寬度
        }
        else{
        	divObj.css("width", parseInt(fwidth));	
        }

        // 欄位設定功能
        var configSpan = $('<span style="float:left;margin-left:5px" class="fvfConfig ui-icon"></span>');

        configSpan.addClass(configClosed);	

        $(divObj).append(configSpan);
		

		$('#formArea').append(divObj);

        // 2. 欄位拖曳處理
	    $("#" + thisID).draggable({
	    	containment: '#formArea', 
			scroll: false,

	        start: function(ev, ui) {
	        	ev.stopPropagation();
	            $(this).is(".ui-selected") || $(".ui-selected").removeClass("ui-selected");
	           
	            selected = $(".ui-selected").each(function() {
	                var el = $(this);
	                el.data("offset", el.offset());
	            });

	            $('div[id*="'+thisID+'_"]').each(function() {				            	
	                var el = $(this);
	                el.data("offset", el.offset());				                				                
	            });	
	            offset = $(this).offset();
	        },
	        drag: function(ev, ui) {
	        	ev.stopPropagation();
	            var dt = ui.position.top - offset.top, dl = ui.position.left - offset.left;
	            selected.not(this).each(function() {
	                var el = $(this), off = el.data("offset");
	                el.css({top: off.top + dt, left: off.left + dl});				                
	            });

	            $('div[id*="'+thisID+'_"]').each(function() {				            	
	                var el = $(this), off = el.data("offset");
	                el.css({top: off.top + dt, left: off.left + dl});				                
	            });	
	            // Prevent button inside div to be triggered
	            $(this).data('isDragging', true);			            				            
	        },
	        stop: function(ev, ui){	
	        	ev.stopPropagation();	        	
	        }
	    }).mousemove(function(e){
			var coord = $(this).position();
			$("div#status").text( "left: " + coord.left + ", top: " + coord.top );
		}).mouseup(function(e){
			var coords=[];
			var coord = $(this).position();
			var item={ coordTop:  coord.left, coordLeft: coord.top  };
		   	coords.push(item);
		}).resizable({
		    handles: 'e',
            maxWidth: 500,    // Todo: Lib parament: (500) 預設 最大欄位寬度
            minWidth: 100,    // Todo: Lib parament: (100) 預設 最小欄位寬度
            resize: function(event, ui) {
            	var fWidth = $(this).css('width');
       			$('div[id*="'+thisID+'_"]').each(function() {				            	
	                var el = $(this);
	                el.css('width', fWidth);				                
	            });	
            }
		});

        // 3. 單擊選擇
        $('#' + thisID).click(function(e){
        	// click through the div to span (click the span icon)
		    if ($(e.target).is("span")) return;
		    if ($(e.target).is("button")) return;
            e.stopPropagation();

            if($(this).is(".ui-selected")){
            	$(this).removeClass('ui-selected');
            }
            else{
            	$(this).addClass('ui-selected');	
            }
		});

		// 4. 欄位設定按鈕
        $('#' + thisID + ' span.fvfConfig').click(function (e){
        	// Prevent button inside div to be triggered	                	
            if($(this).hasClass(configClosed)) {
            	$(this).removeClass(configClosed).addClass(configOpened);
            	//$(this).addClass('configuring');

                // 展開設定面板
                var configDiv = $('<div class="config"></div>');
                configDiv.addClass('configuring');

				var fSLabel = $('<label>欄位長度</label>');
				var fSInput = $('<input class="fvfcWidth" type="text" size="3" maxlength="3">');
				fSInput.val(parseInt($('#' + thisID).css('width')));
				configDiv.append(fSLabel);
				configDiv.append(fSInput);
				configDiv.append('px<br/>');

				var fWALabel = $('<label>對齊方式</label>');
				configDiv.append(fWALabel);
				var fWASelect = $('<select class="fvfcTAlign"><option value="置左">置左</option><option value="置中">置中</option><option value="置右">置右</option></select><br/>');
				fWASelect.val($(this).parent().data('ftalign'));
				configDiv.append(fWASelect);

				configDiv.append($('<hr>'));

				var fButtonSpan = $('<span align="right"></span>');							
				var fOKButton = $('<button>確定</button>');
				var fCancelButton = $('<button>離開</button>');
				fCancelButton.bind('click', function() {
					$(this).closest(".config").siblings(".fvfConfig").click();
				});
				fOKButton.bind('click', function() {
				    // Apply [欄位長度]							
					$(this).closest('.fvField').css('width', $(this).closest(".config").children('.fvfcWidth').val());
					// Apply [文字對齊方式]
					$(this).closest('.fvField').data('ftalign', $(this).closest(".config").children('.fvfcTAlign').val());
				});
				fButtonSpan.append(fOKButton);
				fButtonSpan.append(fCancelButton);
				configDiv.append(fButtonSpan);

                $(this).closest('.fvField').append(configDiv);

                $('.fvField').not($(this).closest('#' + thisID)).css('z-index', 100);
                $(this).closest('.fvField').css('z-index', 10000);
                $(this).closest('.fvField').removeClass('fv-opacity');
        	}
        	else{
				$(this).removeClass(configOpened).addClass(configClosed);
                
                // 關閉設定面板
				$('#' + thisID + ' div.config').remove();
				$(this).closest('#' + thisID).css('z-index', 100);
				$(this).closest('#' + thisID).addClass('fv-opacity');
        	}                        
        });

		if(fieldObj.ftype=='多重'){
            var plusSpan = $('<span style="float:right;margin-left:8px" class="ui-icon"></span>');
            plusSpan.addClass(columnPlus);
            var minusSpn = $('<span style="float:right;margin-left:5px" class="ui-icon"></span>');
            minusSpn.addClass(columnMinus);
			$(divObj).append(plusSpan);
		    $(divObj).append(minusSpn);
            //alert(fieldObj.ftype=='多重'); 
            //alert($(divObj).data('nextSubItems'));
            


            // 5. 多重欄位增加按鈕(+)
            $('#' + thisID + ' span.' + columnPlus).click(function (e){	
                createSubItem(e, fieldObj);
				//alert('plus');						
            });
            // 6. 多重欄位減少按鈕(-)
            $('#' + thisID + ' span.' + columnMinus).click(function (e){		                	
            	// Prevent button inside div to be triggered (Todo: refactory)
				if($(this).closest('#' + thisID).data("isDragging")){
					$(this).closest('#' + thisID).removeData("isDragging");
					return
				}
				e.stopPropagation();

				var nextSubItems = parseInt($('#' + thisID).data("nextSubItems"));
				
				if(!nextSubItems){
					$('#' + thisID).data("topInterval", 30); // Todo: Lib parament: (30) 預設 subitem 之間的間距
					return;
				};
				//alert(nextSubItems);
				$('#' + thisID + '_' + nextSubItems).remove();
				$('#' + thisID).data("nextSubItems", nextSubItems -1);

				//alert('minus');						
            });

            var nextSubItems = parseInt(fieldObj.flocation.split(",")[2]);
            //alert(nextSubItems);
            for(var i=0; i < nextSubItems; i++){
            	$('#' + thisID + ' span.' + columnPlus).trigger('click');
            }
    	}
	};

	// 產生子欄位 // isAddSubItems
	var createSubItem = function(e, fieldObj){
		var thisID = 'id' + fieldObj.id;
		var fieldDiv = $('#' + thisID);

    	// Prevent button inside div to be triggered (Todo: refactory)
		if(fieldDiv.data("isDragging")){
			fieldDiv.removeData("isDragging");
			return
		}
		e.stopPropagation();
		
		var nextSubItems = parseInt(fieldDiv.data("nextSubItems"));
        
		// if(!nextSubItems){
		// 	nextSubItems = 1;
		// 	//alert(nextSubItems);
		// }
		// else{
		nextSubItems++;	
		//}	                        
   
        var divLeft = parseInt(fieldDiv.css('left'));
        var divTop = parseInt(fieldDiv.css('top'));	                        
        var topInterval = parseInt(fieldDiv.data("topInterval"));

		var divObj = $("<div id='" + thisID + '_' + nextSubItems + "' style='left:" + divLeft + "px;top:" + (divTop+nextSubItems*topInterval) + "px;' class='fvSubField'></div>");

        divObj.css('width', fieldDiv.css('width'));

		$('#formArea').append(divObj);
		fieldDiv.data("nextSubItems", nextSubItems);

			if(nextSubItems==1){
				divObj.draggable({
				    axis: "y",
				    drag: function(ev, ui) {
				    	ev.stopPropagation();
                        var subTop = parseInt($('#'+thisID+'_1').css('top').replace("px", ""));
                        var topInterval = subTop - divTop;
                        fieldDiv.data("topInterval", topInterval);
                    	//alert(invTop);
				    	$('div[id*="'+thisID+'_"]').not(this).each(function() {
                			var el = $(this);
                			var theID = parseInt(el.attr('id').split("_")[1]);
                			//alert(theID);
                			el.css({top: divTop + theID * topInterval});				                
            			});	
				    },
					stop: function(ev, ui){	
                    	ev.stopPropagation();
    				}
				});
			}						
	};

	var createListObj = function(){
		var listObject ={fid: "1", fgid: "0", fx: "100", fy: "200", fwidth: "160", flalign: "right", ftext:"哈哈"};
		return listObject;
	};

    $("button").button();

	// 處理[初始定位]
	var initLocation = function(fields){
        $("#formArea div").remove();

    	//alert("Use Default Fields");
    	fields = [         	
			{id:"1", fname:"簽名"    , ftype:"單一", flocation:"", fwidth: "100", ftalign: "置左", fstatus:"未設定"},
			{id:"2", fname:"科目"    , ftype:"多重", flocation:"", fwidth: "110", ftalign: "置中", fstatus:"未設定"},
			{id:"3", fname:"摘要"    , ftype:"多重", flocation:"", fwidth: "120", ftalign: "置右", fstatus:"未設定"},
			{id:"4", fname:"金額"    , ftype:"多重", flocation:"", fwidth: "130", ftalign: "置左", fstatus:"未設定"},
			{id:"5", fname:"放款幣別", ftype:"單一", flocation:"", fwidth: "140", ftalign: "置中", fstatus:"未設定"},
			{id:"6", fname:"匯率"    , ftype:"單一", flocation:"", fwidth: "150", ftalign: "置右", fstatus:"未設定"},
			{id:"7", fname:"還款幣別", ftype:"單一", flocation:"", fwidth: "160", ftalign: "置左", fstatus:"未設定"},
			{id:"8", fname:"扣款帳號", ftype:"單一", flocation:"", fwidth: "170", ftalign: "置中", fstatus:"未設定"},
			{id:"9", fname:"總金額"  , ftype:"單一", flocation:"", fwidth: "180", ftalign: "置右", fstatus:"未設定"}
        ]; 

        for(var i = 0; i < fields.length; i++){
            createField(fields[i]);	
        }

        $("#list").jqGrid("clearGridData", true);
        for(var i=0;i<=fields.length;i++){
        	$('#list').jqGrid('addRowData',i+1,fields[i]);
        }
        $('#list').trigger("reloadGrid");
		//alert('initLocation');
	};
    $("#initButton").click(
    	function(){
        	initLocation(fields);
    	}
    );
    
    // 處理[載入定位]
    $("#loadButton").click(
    	function(){ 
    		drawMiniature();
    		$("#formArea div").remove();
    		// $.ajax({
    		// 	url: "webroot/handler/codetypehandler/getRptDef",
    		// 	data: $.extend(mform.serializeData(), {
    		// 		type: "A"
    		// 	}),
    		// 	success: function(data){
    		// 		//alert(JSON.stringify(data));
    		// 		fields = data.fields;
            	
    		// 		for(var i = 0; i < fields.length; i++){
    		// 			createField(fields[i]);	
    		// 		}

    		// 		$("#list").jqGrid("clearGridData", true);

    		// 		for(var i=0;i<=fields.length;i++){
    		// 			$('#list').jqGrid('addRowData',i+1,fields[i]);
    		// 		}

    		// 		$('#list').trigger("reloadGrid");
    		// 	}
    		// });
            $.getJSON("fd.json", function(json) {
            	fields = json;
				console.log(fields); // this will show the info it in firebug console
				for(var i = 0; i < fields.length; i++){
	            	createField(fields[i]);	
	        	}


		        $("#list").jqGrid("clearGridData", true);
		        for(var i=0;i<=fields.length;i++){
		        	$('#list').jqGrid('addRowData',i+1,fields[i]);
		        }
		        $('#list').trigger("reloadGrid");
			});

    	});

	// 處理[完成定位]				    
    $("#OutputButton").click(function(){
    	//$.blockUI({ message: $('#question'), css: { width: '500px', top:'10px',left:"10px" } });
    	$('#field-locator').dialog("open");

    	
    	$("#list").jqGrid("clearGridData", true);
		for(var i=0;i<fields.length;i++){
            var theLeft = parseInt($('#id'+ (i+1)).css('left'));
            var theTop = parseInt($('#id'+ (i+1)).css('top'));
            var nextSubItems = $('#id'+ (i+1)).data('nextSubItems');
            var topInterval = $('#id'+ (i+1)).data('topInterval');
            if(fields[i].ftype=='多重'){
            	fields[i].flocation = theLeft + ',' + theTop + ',' + nextSubItems + ',' + topInterval;
            }
            else{
            	fields[i].flocation = theLeft + ',' + theTop;
            }
            
            fields[i].fwidth = parseInt($('#id'+ (i+1)).css('width'));
            fields[i].ftalign = $('#id'+ (i+1)).data('ftalign');

			$('#list').jqGrid('addRowData',i+1,fields[i]);
		}
        $('#list').trigger("reloadGrid");

	    try {
	        localStorage.setItem('FormViewer.fields', JSON.stringify(fields));
	    }
	    catch (err) {
	    	console.log("fail to call localStorage.setItem()");
        }
        
		console.log(JSON.stringify(fields));
		//alert("Output to the console.")
    });

	// 處理[報表預覽]	
	$("#previewButton").click(function(){					
		var data = {}; // New object
		data['f_1'] = '簡經理';
		data['f_2'] = ['100學年度 學費', '100學年度 住宿費'];
		data['f_3'] = ['代墊', '誠齋(男生宿舍)'];
		data['f_4'] = [15000, 8000];
		data['f_5'] = '台幣';
		data['f_6'] = '1:33.37';
		data['f_7'] = '美金';
		data['f_8'] = '002356473567';
		data['f_9'] = 23000;

		var labels  = {}; // labelObj JSON.stringify(labels)
		for(var key in data){
			// if(labels.length){
			// 	labels[labels.length] = createListObj();
			// }
			// else{
			// 	labels[0] = createListObj();	
			// }
			// alert(key);
			var fitem = $('#id' + key.split('_')[1]);
			var theAlign = fitem.data("ftalign");
			if(theAlign == '置左'){
				theAlign = 'left';
			}
			else if(theAlign == '置中'){
				theAlign = 'center';
			}
			else if(theAlign == '置右'){
				theAlign = 'right';
			}
			fitem.empty().removeClass('fvField').addClass('showContent').draggable('destroy');
			if(data[key].constructor.toString().indexOf('Array') == -1){
				// 單一	, 可再用欄位定義檢查一次							
				fitem.html(data[key]);
				fitem.css('text-align',theAlign);
			}
			else{
				// 多重
				var dataCount = data[key].length;
				for(var i =0; i < dataCount; i++){
					if(i==0){
						fitem.html(data[key][i]);
						fitem.css('text-align',theAlign);
					}
					else{
						var fsubItem = $('#id' + key.split('_')[1] + '_' + i);
						fsubItem.empty().removeClass('fvSubField').addClass('showContent').draggable('destroy');
						fsubItem.html(data[key][i]);
						fsubItem.css('text-align',theAlign);
					}
				}							
			}
		}

		//alert(JSON.stringify(labels));
	    // var recipe =  window.open('','RecipeWindow','width=600,height=600');
	    // var html = '<html><head><title>Print Your Recipe</title></head><body><div id="myprintrecipe">' + $('<div />').append($('#report').clone()).html() + '</div></body></html>';
	    // recipe.document.open();
	    // recipe.document.write(html);
	    // recipe.document.close();

	});

    $("#formArea").selectable({
    	filter: ':not(".fvSubField")'
    });

    // 欄位方向鍵微調
	$("body").keydown(function(e) {
		if(e.keyCode == 37) { // left
		    selected = $(".ui-selected").each(function() {
		        var el = $(this);
		        el.css({left: parseInt($(this).css('left').replace("px", "")) - 1});					        
		    });
		}
		else if(e.keyCode == 39) { // right						
		    selected = $(".ui-selected").each(function() {
		        var el = $(this);					        
		        el.css({left: parseInt($(this).css('left').replace("px", "")) + 1});    
		    });
		}
		else if(e.keyCode == 38) { // up
		    selected = $(".ui-selected").each(function() {
		        var el= $(this);
		        el.css({top: parseInt($(this).css('top').replace("px", "")) - 1});
		    });
		}
		else if(e.keyCode == 40) { // down
		    selected = $(".ui-selected").each(function() {
		        var el= $(this);
		        el.css({top: parseInt($(this).css('top').replace("px", "")) + 1});
		    });
		}

	}).keyup(function(e) {
		if(e.keyCode == 27) { // ESC
			//alert("esc");
		    selected = $(".ui-selected").each(function() {
		        var el= $(this);
		        el.removeClass("ui-selected");
		    });	
		    $.unblockUI(); 
		}	
	});

    $("#list").jqGrid({
		//url:'example.json',
		datatype: 'local',
		mtype: 'GET',
		colNames:['名稱', '種類', '位置', '欄寬', '對齊'],
		colModel :[ 
			{name:'fname', index:'fname', width:120}, 
			{name:'ftype', index:'ftype', width:50, align:'center'}, 
			{name:'flocation', index:'flocation', width:100, align:'left'}, 
			{name:'fwidth', index:'fwidth', width:50, align:'left'},
			{name:'ftalign', index:'ftalign', width:50, align:'center'}
		],
		onSelectRow: function(id){
			selected = $(".ui-selected").each(function() {
		    	var el= $(this);
		    	el.removeClass("ui-selected");
			});		
			$('#id' + id).click();
		},
		height: 280,
		sortname: 'invid',
		sortorder: 'desc',
		viewrecords: true,
		gridview: true,
		caption: '欄位定位'
    });
    $("#list-pager").hide();    

    var downloadURL = function downloadURL(url)
    {
    	var iframe;
        iframe = document.getElementById("hiddenDownloader");
        if (iframe === null)
        {
            iframe = document.createElement('iframe');  
            iframe.id = "hiddenDownloader";
            iframe.style.visibility = 'hidden';
            document.body.appendChild(iframe);
        }
        iframe.src = url;   
    };

    $('#printButton').click(function() {
    	   //window.location = "webroot/handler/codetypehandler/getPDF";
    	   downloadURL("webroot/handler/codetypehandler/getPDF");
    	});
 
});