var utils = {
    formatRelativeTime : function(date){
        const now = new Date();
        const diff = now - date;
  
        //millisecond to second
        const seconds = Math.floor(diff/1000);
          if(seconds < 60){
          return `${seconds}s`;
          }
         
          //second to minute
          const minute = Math.floor(seconds/60);
          if(minute < 60){
          return `${minute}m`;
          }
  
          //minute to hour
          const hour = Math.floor(minute/60);
          if(hour < 60){
          return `${hour}h`;
          }
  
          //hour to day
          const days = Math.floor(hour/24);
          if(days < 7){
          return `${days}d`;
          }
    }
}
module.exports = utils;