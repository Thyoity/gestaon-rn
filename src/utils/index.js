import _ from 'lodash';
import moment from 'moment';

export default {

    /*
     * Overall
     */

    assignToExistentKeys(targetObj, obj){
        return _.assign(targetObj, _.pick(obj, _.keys(targetObj)));
    },

    removeReactivity(obj){
        return JSON.parse(JSON.stringify(obj));
    },

    /*
     * Masks
     * */

    formatPhone(phoneNumber){
        phoneNumber = phoneNumber.toString().trim()
        const ddd = phoneNumber.substring(0, 2)
        const number = phoneNumber.substring(2)
        if(number.length === 8){
            return '(' + ddd + ') ' + number.substring(0, 4) + '-' + number.substring(4, 8)
        }
        else if(number.length === 9){
            return '(' + ddd + ') ' + number.substring(0, 5) + '-' + number.substring(5, 10)
        }
        else{
            return false
        }
    },

    formatMoney(number = 0,places, symbol, thousand, decimal) {
        places = !isNaN(places = Math.abs(places)) ? places : 2
        symbol = symbol !== undefined ? symbol : "$"
        thousand = thousand || ","
        decimal = decimal || "."
        let negative = number < 0 ? "-" : "",
            i = parseInt(number = Math.abs(+number || 0).toFixed(places), 10) + "",
            j = (j = i.length) > 3 ? j % 3 : 0;
        return symbol + negative + (j ? i.substr(0, j) + thousand : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousand) + (places ? decimal + Math.abs(number - i).toFixed(places).slice(2) : "")
    },

    formatDateAndTime(dateAndTime, format){
        return moment(dateAndTime).format(format);
    },

    /*
    * Get
    * */

    getShortString(str, max, add){
        add = add || '...';
        return (typeof str === 'string' && str.length > max ? str.substring(0,max).trim() + ' ' + add : str.trim());
    },
    getDDDAndNumber(phoneNumber){
        phoneNumber.replace(/\D/g,'');
        const ddd = phoneNumber.substring(0,2);
        const number = phoneNumber.substring(2);
        return {
            ddd,
            number
        };
    },
    getElPositionInScreen(el){
        let xPos = 0, yPos = 0;
        while (el) {
            if (el.tagName.toLowerCase() === "body") {
                let xScroll = el.scrollLeft || document.documentElement.scrollLeft;
                let yScroll = el.scrollTop || document.documentElement.scrollTop;
                xPos += (el.offsetLeft - xScroll + el.clientLeft);
                yPos += (el.offsetTop - yScroll + el.clientTop);
            } else {
                xPos += (el.offsetLeft - el.scrollLeft + el.clientLeft);
                yPos += (el.offsetTop - el.scrollTop + el.clientTop);
            }
            el = el.offsetParent;
        }
        return { x: xPos, y: yPos };
    },

    /*
    * Tracker utilities
    * */

    isDistanceViableThroughSpeed(speed, timeDifference, distance){
        if(distance < ((speed / 3.6) * timeDifference))
            return true;
        else
            return false;
    },

    getRandomDarkColor(){
        let letters = '012345'.split('');
        let color = '#';
        color += letters[Math.round(Math.random() * 5)];
        letters = '0123456789ABCDEF'.split('');
        for(let i = 0; i < 5; i++){
            color += letters[Math.round(Math.random() * 15)];
        }
        return color;
    },

    // Get Direction by Rotation Degree

    getDirection(rotation){

        if(rotation >= 0 && rotation <= 11.25){
            return "Norte";
        }
        else if(rotation > 11.25 && rotation < 33.75){
            return "NNE";
        }
        else if(rotation > 33.75 && rotation < 56.25){
            return "Nordeste";
        }
        else if(rotation > 56.25 && rotation < 78.75){
            return "ENE";
        }
        else if(rotation > 78.75 && rotation < 101.25){
            return "Leste";
        }
        else if(rotation > 101.25 && rotation < 123.75){
            return "ESE";
        }
        else if(rotation > 123.75 && rotation < 146.25){
            return "Sudeste";
        }
        else if(rotation > 146.25 && rotation < 168.75){
            return "SSE";
        }
        else if(rotation > 168.75 && rotation < 191.25){
            return "Sul";
        }
        else if(rotation > 191.25 && rotation < 213.75){
            return "SSW";
        }
        else if(rotation > 213.75 && rotation < 236.25){
            return "Sudoeste";
        }
        else if(rotation > 236.25 && rotation < 258.75){
            return "WSW";
        }
        else if(rotation > 258.75 && rotation < 281.25){
            return "Oeste";
        }
        else if(rotation > 281.25 && rotation < 303.75){
            return "WNW";
        }
        else if(rotation > 303.75 && rotation < 326.25){
            return "Noroeste";
        }
        else if(rotation > 326.25 && rotation < 348.75){
            return "NNW";
        }
        else if(rotation > 348.75 && rotation < 360){
            return "Norte";
        }

    }

}
