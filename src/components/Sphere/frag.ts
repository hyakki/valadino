export default `
  precision highp float;

  uniform float time;
  uniform vec2 mouse;
  uniform float progress;

  varying vec2 vUv;

  float rad = 0.1;

  vec3 getColor(float t) {
    vec3 a = vec3(0.1, 0.2, 0.2);
    vec3 b = vec3(0.4, 0.2, 0.6);
    vec3 c = vec3(0.3, 0.3, 0.1);
    vec3 d = vec3(0.2, 0.2, 0.2);

    vec3 color = a + b * cos(6.28319 * (c + t * d)); 

    return color;
  }

  float sdSphere( vec3 p, float r ) {
    return length(p) - r;
  }

  float sineCrazy(vec3 p) {
    // float coef = 0.9 * ((1.0 - sin(time / 1000.0)) * 1.4);

    float coef = 1.0;
    return (sin(p.x * coef) - sin(p.z * coef) + sin(p.y * coef)) / 3.0; 
  }

  vec3 getNormal(vec3 p, float r) {
    vec2 o = vec2(0.001, 0.0);
    return normalize(
      vec3(
        sdSphere(p + o.xyy, r) - sdSphere(p - o.xyy, r),
        sdSphere(p + o.yxy, r) - sdSphere(p - o.yxy, r),
        sdSphere(p + o.yyx, r) - sdSphere(p - o.yyx, r)
      )
    );
  }

  float opSmoothUnion( float d1, float d2, float k ) {
    float h = clamp( 0.5 + 0.5*(d2-d1)/k, 0.0, 1.0 );
    return mix( d2, d1, h ) - k*h*(1.0-h);
  }

	float createSphere(vec3 p, vec3 direction, float distance, float rad, float progress) {
	  vec3 dNorm = normalize(direction) * distance;
    return sdSphere(p - (dNorm * progress * 1.0), rad);
	}

  float scene(vec3 p) {
    float sTime = time / 1000.0;

		float main = createSphere(p, vec3(0.0, 0.0, 2.0), 0.0, rad * 6.0, 1.0);

		float s2 = createSphere(p, vec3(-1.0, 0.0, 0.0), 1.0, rad, progress);
		float s3 = createSphere(p, vec3(0.0, 1.0, 0.0), 1.0, rad, progress);
		float s4 = createSphere(p, vec3(0.5, 0.5, 0.0), 0.9, rad * 0.7, progress);
		float s5 = createSphere(p, vec3(-0.3, 0.5, 0.0), 0.8, rad * 0.3, progress);
		float s6 = createSphere(p, vec3(-0.4, -0.4, 0.0), 1.0, rad * 0.6, progress);
		float s7 = createSphere(p, vec3(0.5, 0.6, 1.0), 0.8, rad * 0.5, progress);
		float s8 = createSphere(p, vec3(0.3, -0.8, -0.2), 0.8, rad * 0.5, progress);
		float s9 = createSphere(p, vec3(0.5, -0.8, 3.0), 0.8, rad * 0.8, progress);
		float s10 = createSphere(p, vec3(0.5, 0.0, 0.0), 0.8, rad * 0.8, progress);
		float s11 = createSphere(p, vec3(0.5, -0.8, -1.0), 0.8, rad * 0.8, progress);

    float u1 = opSmoothUnion(s2, s3, 0.0);
    float u2 = opSmoothUnion(s4, s5, 0.0);
    float u3 = opSmoothUnion(s6, s7, 0.0);
    float u4 = opSmoothUnion(s8, s9, 0.0);
    float u5 = opSmoothUnion(s10, s11, 0.0);

    float u6 = opSmoothUnion(u1, u2, 0.0);
    float u7 = opSmoothUnion(u3, u4, 0.0);

    float u8 = opSmoothUnion(u5, u6, 0.0);
    float u9 = opSmoothUnion(u7, u8, 0.0);

    float u = u9;

		float s = opSmoothUnion(main, u, 0.5);
		
		return s;
  }

  vec3 calculate_normal(in vec3 p) {
    const vec3 small_step = vec3(0.001, 0.0, 0.0);

    float gradient_x = scene(p + small_step.xyy) - scene(p - small_step.xyy);
    float gradient_y = scene(p + small_step.yxy) - scene(p - small_step.yxy);
    float gradient_z = scene(p + small_step.yyx) - scene(p - small_step.yyx);

    vec3 normal = vec3(gradient_x, gradient_y, gradient_z);

    return normalize(normal);
  }

  vec3 rayMarch(vec3 camPos, vec3 ray) {
    vec3 rayPos = camPos;
    float curDist = 0.0;
    float rayLen = 0.0;

    for(int i = 0; i <= 64; i++) {
      curDist = scene(rayPos);
      rayLen += curDist;
      rayPos = camPos + (ray * rayLen);

      if (abs(curDist) < 0.001) {
        return rayPos;
      }
    }
  }

  vec3 ray_march(in vec3 ro, in vec3 rd) {
    float total_distance_traveled = 0.0;
    const int NUMBER_OF_STEPS = 32;
    const float MINIMUM_HIT_DISTANCE = 0.001;
    const float MAXIMUM_TRACE_DISTANCE = 1000.0;

    for (int i = 0; i < NUMBER_OF_STEPS; ++i)
    {
        // Calculate our current position along the ray
        vec3 current_position = ro + total_distance_traveled * rd;

        // We wrote this function earlier in the tutorial -
        // assume that the sphere is centered at the origin
        // and has unit radius
        float distance_to_closest = scene(current_position);

        if (distance_to_closest < MINIMUM_HIT_DISTANCE) // hit
        {
            // We hit something! Return red for now
            return vec3(1.0, 0.0, 0.0);
        }

        if (total_distance_traveled > MAXIMUM_TRACE_DISTANCE) // miss
        {
            break;
        }

        // accumulate the distance traveled thus far
        total_distance_traveled += distance_to_closest;
    }

    // If we get here, we didn't hit anything so just
    // return a background color (black)
    return vec3(0.0);
  }

  void main() {
    // vec2 newUV = gl_FragCoord.xy / resolution.xy;
    // p.x *= resolution.x/resolution.y;
    // p.x += mouse.x / 60.0;
    // p.y += mouse.y / 60.0;

    vec2 p = vUv - vec2(0.5);

    vec3 camPos = vec3(0.0, 0.0, 3.0);
    vec3 ray = normalize(vec3(p, -1.0));
    vec3 light = vec3(-1.0, 1.0, 1.0);

    vec3 rPos = ray_march(camPos, ray);
    vec3 n = calculate_normal(rPos);
    float diff = dot(n, light);

    float v = rPos.r;
    
		vec3 color = vec3(v); 

    gl_FragColor = vec4(color, 1.0 );
  }
`
