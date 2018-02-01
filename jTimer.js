    var isCounting = false;
    var isTomatoCounting = false;
    var timeoutHandler, intervalHandler;
    var timingBtn = $('#timingBtn');
    var recoredItem = {start: 0, end: 0, des: ""};//开始和结束时间戳
    var STORAGE_KEY = 'jtimer-v';
    var records = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    // var formatDateStr = "yy/MM/dd HH:mm:ss";
    var formatDateStr = "HH:mm:ss";
    var ringbells = [];



    function init() {

        var date = new Date();
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);

        var today = $.jFormatDate(date, "yyyy-MM-dd");
        $('#dateInput').val(today);
        //将当天零点的时间戳存储在dateInput数据属性里,时间记录只显示这个时间所指日期的记录
        $('#dateInput').attr('data-today', date.getTime());


        if(records.length) {
            showRecordList();
        }
        $('#tomatoTime').html($('#tomatoTime').attr('data-time'));
        $('#tomatoRest').html($('#tomatoRest').attr('data-time'));

        //闹钟默认为当前时间
        var now = new Date().getHours() > 10 ? new Date().getHours() : '0' + new Date().getHours();
        now += ":";
        now += new Date().getMinutes() > 10 ? new Date().getMinutes() : '0' + new Date().getMinutes();
        $('#ring-time').val(now);

    }
    init();

    //设置闹钟
    $('#add-ring').click(function(event) {

        var targetHM =  $('#ring-time').val();
        var targetRingTime = new Date();
        //时间格式是：20:30，只有小时和分钟
        var ringtime = targetHM.split(':');
        targetRingTime.setHours(parseInt(ringtime[0]));
        targetRingTime.setMinutes(parseInt(ringtime[1]));
        targetRingTime.setSeconds(0);
        targetRingTime.setMilliseconds(0);
        //目标闹钟时间戳
        var targetRingTime = targetRingTime.getTime();

        if(ringbells.indexOf(targetHM) != -1) {
            //已设置过该时刻的闹钟
            alert('已设置过');
            return;
        }

        var ringtimeoutHandler = setTimeout(function() {
            musicPlay();
            //删除闹钟列表中的已响铃的闹钟
            ringbells.splice(ringbells.indexOf(targetHM), 1); 
            clearTimeout(ringtimeoutHandler);
            showRings();
        }, targetRingTime - Date.now());
        ringbells.push(targetHM);
        showRings();

    });

    function showRings() {
        if(ringbells.length === 0) {
            $('#rings').html('');
            return;
        }

        var showHtml = '<div>已设置的闹钟：</div>';
        ringbells.forEach(function(item) {
            showHtml += '<div>' + item + '</div>';
        });
        $('#rings').html(showHtml);
    }

    //当日期发生变化时，根据选择的新日期显示记录
    $('#dateInput').on('change', function(event) {

        var arr =  $('#dateInput').val().split('-');
        var date = new Date();
        date.setFullYear(arr[0]);
        date.setMonth(parseInt(arr[1]) - 1);
        date.setDate(arr[2]);
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);

        $('#dateInput').attr('data-today', date.getTime());
        showRecordList();
    });

    //为自动生成的li中的删除button添加点击事件
    $('#recordList').on('click', 'button.deleteRecordItem', function(event) {
        var start = $(event.target).attr('data-start');
        for(var i = 0; i < records.length; i++) {
            if(records[i].start == parseInt(start)) {
                records.splice(i, 1);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
                showRecordList();
                break;
            }
        }
    });


    function submitDescription(event) {
        
        for (var i = records.length - 1; i >= 0; i--) {
            if(records[i].start == parseInt($(event.target).attr('data-start'))) {
                records[i].des = $(event.target).val();
                localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
                break;
            }
        }
        //按enter编辑完成后，隐藏input，显示label
        $(event.target).css('display', 'none');
        var start = $(event.target).attr('data-start');
        var selector = "label[data-start=" + start + "].description";
        $(selector).css('display', 'inline');
        showRecordList();

    }

    //为自动生成的li中的input文本输入框添加按下enter键盘事件
    $('#recordList').on('keyup', '.descriptionEdit', function(event) {
        if (event.keyCode == 13) {
            submitDescription(event);
        }
    });

            //为自动生成的li中的input文本输入框添加blur事件
    $('#recordList').on('blur', '.descriptionEdit', function(event) {
        submitDescription(event);
    });


    //为自动生成的li中的label文本添加双击事件，双击后可编辑，即，双击后label隐藏，input显示，在同一位置
    $('#recordList').on('dblclick', '.description', function(event) {
        $(event.target).css('display', 'none');

        var start = $(event.target).attr('data-start');
        var selector = "input[data-start=" + start + "].descriptionEdit";
        $(selector).css('display', 'inline');
        $(selector).focus();
     });



    $('.tomato').click(function(event) {
        var countingDownTime = parseInt($(event.target).attr('data-time'));


        //如果当前倒计时正在计时，则点击番茄后，结束计时
        if(isCounting) {
            $('#timingBtn').click();
        }
        //如果当前番茄钟未开启
        if(!isTomatoCounting) {

            isTomatoCounting = true;
            //设置倒计时不可用
            $('#timingBtn').attr('disabled', 'disabled');
            //正在计时则其他所有番茄按钮都不能点击
            $('.tomato').attr('disabled', 'disabled');
            //当前番茄可以点击，点击时询问是否结束番茄
            $(event.target).removeAttr('disabled');
            recoredItem.start = Date.now();
            timeoutHandler = setTimeout(function() {
                tomatoTimeout(event.target, countingDownTime, true);
            }, countingDownTime * 60 * 1000);
            intervalHandler = setInterval(function(){
                showTomatoLeftTime(event.target, countingDownTime);
            }, 1 * 1000);

        } else {
            //如果当前番茄正在计时时点击，询问是否要结束该番茄计时
            var result = confirm('确定要结束该番茄吗？');
            if(result) {
                tomatoTimeout(event.target, countingDownTime, false);
            }
        }

    });


    function tomatoTimeout(targetElm, countingDownTime, needRemind) {
        if(needRemind) {
            musicPlay();
        }
        isTomatoCounting = false;
        $('.tomato').removeAttr('disabled');
        $(targetElm).html(countingDownTime);
        $('#timingBtn').removeAttr('disabled');

        clearTimeout(timeoutHandler);
        clearInterval(intervalHandler);

        recoredItem.end = Date.now();
        saveRecords(recoredItem.start, recoredItem.end, recoredItem.des);
        
        showRecordList();

    }

    timingBtn.click(function() {

        if(!isCounting) {
            //start timing
            startTiming();
        } else {
            //end timing
            endTiming();
        }
    });

    function startTiming() {

        //recoredItem = {start: 0, end: 0};//开始和结束时间戳
        isCounting = true;
        //timingBtn.val("结束计时");  
        timingBtn.html("结束");  
        recoredItem.start = Date.now();
        var timingTime = $('#timingTime').val();
        timeoutHandler = setTimeout(timeout, timingTime * 60 * 1000);
        intervalHandler = setInterval(showLeftTime, 1 * 1000);
    }

    function showLeftTime() {
        var result = getLeftTime(parseInt($('#timingTime').val()), true);
        $('#leftTime').html(result);
    }

    function showTomatoLeftTime(targetElm, countingDownTime) {
        var text = getLeftTime(countingDownTime, false);
        $(targetElm).html(text);
    }

    function getLeftTime(countingTime, needHours) {
        var now = Date.now();
        //countTime是分钟，转成秒来计算
        var time = countingTime * 60;
        var left = time - Math.floor((now - recoredItem.start)/(1000));
        var result = "";
        var hours = 0;

        if(left >= 0) {

            if(needHours) {
                hours = Math.floor(left/3600);
                result += hours > 0 ? (toFixedWidth(hours) + ":") : "00:";
            }
            var mins = Math.floor((left - hours*3600)/60);
            var seconds = Math.floor(left - hours*3600 - mins*60);

            result += mins > 0 ? (toFixedWidth(mins) + ":") : "00:";
            result += seconds > 0 ? toFixedWidth(seconds) : "00";
        }

        return result;
        
    }


    function toFixedWidth(value) {
        var result = "";
        if(value < 10) {
            result += "0" + value;
        } else {
            result = value;
        }
        return result;
    }

    function endTiming() {
        isCounting = false;
        timingBtn.html("开始");
        clearTimeout(timeoutHandler);
        clearInterval(intervalHandler);
        $('#leftTime').html("");

        recoredItem.end = Date.now();
        saveRecords(recoredItem.start, recoredItem.end, recoredItem.des);

        showRecordList();
    }

    function saveRecords(start, end, des) {
        records.push({start: start, end: end, des: des });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(records));

    }

    function filteredRecords(date) {


        //显示传入日期参数date下的所有时间记录，date是时间戳
        return records.filter(function(item, index, arr) {
            var result = item.start - date;
            if(result >= 0 && result < 24 * 3600 * 1000) {
                return true;
            } else {
                return false;
            }
        });

    }
     

    function showRecordList() {

        var showRecords = filteredRecords(parseInt($('#dateInput').attr('data-today'))) || [];
        if(showRecords.length == 0) {

            $('#recordList').html('<p style="color: red">没有相关记录</p>');
            return;
        }

        var recordContent = "";
        var listHead = "<li class='listHead'>"
            + "<label></label>"
            + "<label class='timespan'>时间范围</label>"
            + "<label class='totalTime'>持续时间</label>"
            + "<label>描述（双击进行编辑）</label>"
            + "</li>";
        var dateTotalTime = 0;
        showRecords.forEach(function(item) {
            var labelContent = "双击添加描述，按回车提交";
            if(item.des.length) {
                labelContent = item.des;
            }

            recordContent += "<li>" 
                + " <button class='deleteRecordItem' data-start='" + item.start + "'>删除</button> " 
                + "<label class='timespan'>" + $.jFormatDate(new Date(item.start), formatDateStr) + " --- " + $.jFormatDate(new Date(item.end), formatDateStr) + "</label>"
                + "<label class='totalTime'> 共: " + Math.round((item.end - item.start)/(1000 * 60)) + " 分钟</label>" 
                + " <label class='description' type='text' data-start='" + item.start + "'>" + labelContent + "</label>" 
                + " <input class='descriptionEdit' type='text' placeholder='添加描述，按回车提交' value='" + item.des + "' data-start='" + item.start + "'>" 
                + "</li>";
;                dateTotalTime += Math.round((item.end - item.start)/(1000 * 60));
        });

        var listFoot = '<li>总计： ' + dateTotalTime + ' 分钟</li>';
        $('#recordList').html(listHead + recordContent + listFoot);
    }



    function timeout() {
        musicPlay();
        endTiming();

    }

    function musicPlay() {
        var playTime = 5;
        var mymusic = document.getElementById("mymusic");
        //每次从0开始播放，播放5秒
        mymusic.currentTime = 0;
        mymusic.play();
        setTimeout('mymusic.pause();', playTime * 1000);
    }

