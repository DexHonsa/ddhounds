import auth from '../../auth';

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
            isTimedOut: false
        }
    },
    mounted(){
        this.init();
    },
    methods: {
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