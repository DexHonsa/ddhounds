import auth from '../../auth';
import Toolbar from '../header';
import Lottie from 'vue-lottie';
import animationData from './data.json';
export default {
    name: 'login',
    data() {
        return {
            email: '',
            password: '',
            errorMessage: '',
            hasError: false,
            isLoading: false,
            attempts: 0,
            timer: 10,
            isTimedOut: false,
            loginOpen:false,
            selector:'corporate',
            menu:false,
            menu2:false,
            isLoading:false,
            defaultOptions: { animationData, loop: true },
            animationSpeed: 1.3,
            term:'',
            wildcards:'Implied Wildcards'
        }
    },
    mounted(){
        //this.init();
    },
    components:{
      Toolbar,
      Lottie
    },
    methods: {
      search(){
        this.isLoading = true;
        setTimeout(()=>{
          this.isLoading = false;
          this.$router.push('/search?page=1&term=' + this.term + '&selector=' + this.selector + '&wildcards=' + (this.wildcards == 'Implied Wildcards'));
        },3000)
      },
      handleAnimation: function(anim) {
        this.anim = anim;
        this.anim.setSpeed(this.animationSpeed);
      },
        init() {
            var falling = true;
      
            TweenLite.set("#container", { perspective: 600 });
            //TweenLite.set("img", { xPercent: "-50%", yPercent: "-50%" });
      
            var container = document.getElementById("container"),
              w = window.innerWidth,
              h = window.innerHeight;
      
            for (let i = 0; i < 10; i++) {
              let Div = document.createElement("div");
              TweenLite.set(Div, {
                attr: { class: "dot" },
                x: R(0, w),
                y: R(-200, -150),
                z: R(-200, 200),
      
                opacity: Math.random() * (1 - 0) + 0
              });
              container.appendChild(Div);
              animm(Div);
            }
      
            function animm(elm) {
              TweenMax.to(elm, R(6, 15), {
                y: h + 100,
                ease: Linear.easeNone,
                repeat: -1,
                delay: -15
              });
              TweenMax.to(elm, R(4, 8), {
                x: "+=100",
                rotationZ: R(0, 180),
                repeat: -1,
                yoyo: true,
                ease: Sine.easeInOut
              });
            }
      
            function R(min, max) {
              return min + Math.random() * (max - min);
            }
          },
        timerInc() {
            if (this.timer != 0) {
                this.isTimedOut = true;
                this.timer = this.timer - 1;
                this.errorMessage = `Please wait ${this.timer} seconds.`;
                setTimeout(this.timerInc, 1000)
            } else {
                this.hasError = false;
                this.isTimedOut = false;
                this.attempts = 2;
            }
        },
        login() {
            if (this.attempts > 2) {
                if (this.isTimedOut) {
                    return;
                }
                this.hasError = true;
                this.timer = 10;
                this.errorMessage = `Please wait ${this.timer} seconds.`;
                this.timerInc();
            } else {
                this.isLoading = true;
                this.hasError = false;
                auth.login({ email: this.email, password: this.password }).then(res => {
                    this.$router.push('/dashboard');

                }, err => {


                    this.attempts = this.attempts + 1
                    this.isLoading = false
                    this.hasError = true;
                    console.log(err);
                    this.errorMessage = err.response.data.error
                })
            }


        }
    }
}