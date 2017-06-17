/*
 * Copyright (c) 2017 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Visualization.Labels.Material {

    export const VERTEX_SHADER = `
uniform float xOffset;
uniform float yOffset;
uniform float zOffset;

varying vec2 texCoord;

attribute vec2 mapping;
attribute vec2 inputTexCoord;
attribute float inputSize;

${THREE.ShaderChunk["color_pars_vertex"]}
${THREE.ShaderChunk["common"]}

float matrixScale( in mat4 m ){
    vec4 r = m[ 0 ];
    return sqrt( r[ 0 ] * r[ 0 ] + r[ 1 ] * r[ 1 ] + r[ 2 ] * r[ 2 ] );
}

void main(void){

    ${THREE.ShaderChunk["color_vertex"]}

    texCoord = inputTexCoord;

    float scale = matrixScale( modelViewMatrix );

    float _zOffset = zOffset * scale;
    if( texCoord.x == 10.0 ){
         _zOffset -= 0.001;
    }

    vec3 pos = position;
    vec4 cameraPos = modelViewMatrix * vec4( pos, 1.0 );
    vec4 cameraCornerPos = vec4( cameraPos.xyz, 1.0 );
    cameraCornerPos.xy += mapping * inputSize * 0.01 * scale;
    cameraCornerPos.x += xOffset * scale;
    cameraCornerPos.y += yOffset * scale;
    cameraCornerPos.xyz += normalize( -cameraCornerPos.xyz ) * _zOffset;

    gl_Position = projectionMatrix * cameraCornerPos;
    //gl_Position.xyz = position.xyz;
}
`

    export const FRAGMENT_SHADER = `
#extension GL_OES_standard_derivatives : enable

uniform sampler2D fontTexture;
uniform float showBorder;
uniform vec3 borderColor;
uniform float borderWidth;
uniform vec3 backgroundColor;
uniform float backgroundOpacity;

varying vec2 texCoord;

${THREE.ShaderChunk["common"]}
${THREE.ShaderChunk["color_pars_fragment"]}
${THREE.ShaderChunk["fog_pars_fragment"]}

const float smoothness = 16.0;
const float gamma = 2.2;

void main(){
    vec4 finalColor;

    if( texCoord.x > 1.0 ){
        finalColor = vec4( backgroundColor, backgroundOpacity );
    }else{
        // // retrieve signed distance
        float sdf = texture2D( fontTexture, texCoord ).a;
        if( showBorder > 0.5 ) sdf += borderWidth;

        // // perform adaptive anti-aliasing of the edges
        float w = clamp(
            smoothness * ( abs( dFdx( texCoord.x ) ) + abs( dFdy( texCoord.y ) ) ),
            0.0,
            0.5
        );
        float a = smoothstep( 0.5 - w, 0.5 + w, sdf );

        // // gamma correction for linear attenuation
        a = pow( a, 1.0 / gamma );
        if( a < 0.2 ) discard;
        //a *= opacity;

        vec3 outgoingLight = vColor;
        if( showBorder > 0.5 && sdf < ( 0.5 + borderWidth ) ){
            outgoingLight = borderColor;
        }

        finalColor = vec4( outgoingLight, a );    
    }

    //gl_FragColor = finalColor;
    vec3 outgoingLight = finalColor.rgb;

    ${THREE.ShaderChunk["fog_fragment"]}
    
    #ifdef USE_FOG
    //    if (finalColor.a > 0.99) { gl_FragColor = vec4(outgoingLight, (1.0 - fogFactor)); }
    //    else { gl_FragColor = vec4( outgoingLight.rgb, (1.0 - fogFactor) * finalColor.a ); }
       float alpha = (1.0 - fogFactor) * finalColor.a;
       if (alpha < 0.2) discard;
       gl_FragColor = vec4( outgoingLight.rgb, alpha );
       //gl_FragColor = finalColor;
    #else
      gl_FragColor = finalColor;
    #endif
}
`

}