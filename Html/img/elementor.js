(function ( $ ) {
	'use strict';

    $( window ).on(
        'load',
        function () {
            for ( var key in qodefCore.shortcodes ) {
                for ( var keyChild in qodefCore.shortcodes[key] ) {
                    qodefElementor.init( key, keyChild );
                }
            }

            qodefElementorSection.init();
            elementorSection.init();
        }
    );

	var qodefElementor = {
		init: function ( key, keyChild ) {
			$( window ).on(
				'elementor/frontend/init',
				function ( e ) {
					elementorFrontend.hooks.addAction(
						'frontend/element_ready/' + key + '.default',
						function ( e ) {
							// Check if object doesn't exist and print the module where is the error
							if ( typeof qodefCore.shortcodes[key][keyChild] === 'undefined' ) {
								console.log( keyChild );
							}

							qodefCore.shortcodes[key][keyChild].init();
						}
					);
				}
			);
		}
	};

	var qodefElementorSection = {
		init: function () {
			$( window ).on(
				'elementor/frontend/init',
				function () {
					elementorFrontend.hooks.addAction( 'frontend/element_ready/section', elementorSection.init );
				}
			);
		}
	};

	var elementorSection = {
		init: function ( $scope ) {
			var $target     = $scope,
				isEditMode  = Boolean( elementorFrontend.isEditMode() ),
				settings    = [],
				sectionData = {};

			//generate parallax settings
			if ( isEditMode && typeof $scope !== 'undefined' ) {

				// generate options when in admin
				var editorElements = window.elementor.elements,
					sectionId      = $target.data( 'id' );

				$.each(
					editorElements.models,
					function ( index, object ) {
						if ( sectionId === object.id ) {
							sectionData = object.attributes.settings.attributes;
						}
					}
				);

				//parallax options
				if ( typeof sectionData.qodef_parallax_type !== 'undefined' ) {
					settings['enable_parallax'] = sectionData.qodef_parallax_type;
				}

				if ( typeof sectionData.qodef_parallax_image !== 'undefined' && sectionData.qodef_parallax_image['url'] ) {
					settings['parallax_image_url'] = sectionData.qodef_parallax_image['url'];
				}

				//offset options
				if ( typeof sectionData.qodef_offset_type !== 'undefined' ) {
					settings['enable_offset'] = sectionData.qodef_offset_type;
				}

				if ( typeof sectionData.qodef_offset_image !== 'undefined' && sectionData.qodef_offset_image['url'] ) {
					settings['offset_image_url'] = sectionData.qodef_offset_image['url'];
				}

				if ( typeof sectionData.qodef_offset_top !== 'undefined' ) {
					settings['offset_top'] = sectionData.qodef_offset_top;
				}

				if ( typeof sectionData.qodef_offset_left !== 'undefined' ) {
					settings['offset_left'] = sectionData.qodef_offset_left;
				}

				//dots options
				if ( typeof sectionData.qodef_dots_type !== 'undefined' ) {
					settings['enable_dots'] = sectionData.qodef_dots_type;
				}

				//generate output backend
				if ( typeof $target !== 'undefined' ) {
					elementorSection.generateOutput( $target, settings );
				}
			} else {

				// generate options when in frontend using global js variable
				var sectionHandlerData = qodefElementorGlobal.vars.elementorSectionHandler;

				$.each(
					sectionHandlerData,
					function ( index, properties ) {

						properties.forEach( function ( property ) {

							if ( typeof property['parallax_type'] !== 'undefined' && property['parallax_type'] === 'parallax' ) {

								$target                        = $( '[data-id="' + index + '"]' );
								settings['parallax_type']      = property['parallax_type'];
								settings['parallax_image_url'] = property['parallax_image']['url'];

								if ( typeof settings['parallax_image_url'] !== 'undefined' ) {
									settings['enable_parallax'] = 'parallax';
								}
							}

							if ( typeof property['offset_type'] !== 'undefined' && property['offset_type'] === 'offset' ) {

								$target                      = $( '[data-id="' + index + '"]' );
								settings['offset_type']      = property['offset_type'];
								settings['offset_image_url'] = property['offset_image']['url'];
								settings['offset_top']       = property['offset_top'];
								settings['offset_left']      = property['offset_left'];

								if ( typeof settings['offset_image_url'] !== 'undefined' ) {
									settings['enable_offset'] = 'offset';
								}
							}

							if ( typeof property['dots_type'] !== 'undefined' && property['dots_type'] === 'dots' ) {

								$target               	= $( '[data-id="' + index + '"]' );
								settings['dots_type'] 	= property['dots_type'];
								settings['enable_dots'] = 'dots';
							}

							//generate output frontend
							if ( typeof $target !== 'undefined' ) {
								elementorSection.generateOutput( $target, settings );

								settings = [];
							}
						} );
					}
				);
			}
		},
		generateOutput: function ( $target, settings ) {

			if ( typeof settings['enable_parallax'] !== 'undefined' && settings['enable_parallax'] === 'parallax' && typeof settings['parallax_image_url'] !== 'undefined' ) {

				$( '.qodef-parallax-row-holder', $target ).remove();
				$target.removeClass( 'qodef-parallax qodef--parallax-row' );

				var $layout = null;

				$target.addClass( 'qodef-parallax qodef--parallax-row' );

				$layout = $( '<div class="qodef-parallax-row-holder"><div class="qodef-parallax-img-holder"><div class="qodef-parallax-img-wrapper"><img class="qodef-parallax-img" src="' + settings['parallax_image_url'] + '" alt="Parallax Image"></div></div></div>' ).prependTo( $target );

				// wait for image src to be loaded
				var newImg    = new Image;
				newImg.onload = function () {
					$target.find( 'img.qodef-parallax-img' ).attr( 'src', this.src );
					qodefCore.qodefParallaxBackground.init();
				};
				newImg.src    = settings['parallax_image_url'];
			}

			if ( typeof settings['enable_offset'] !== 'undefined' && settings['enable_offset'] === 'offset' && typeof settings['offset_image_url'] !== 'undefined' ) {

				$( '.qodef-offset-image-holder', $target ).remove();
				$target.removeClass( 'qodef-offset-image' );

				var $layout = null;

				$target.addClass( 'qodef-offset-image' );

				$layout = $( '<div class="qodef-offset-image-holder" style="position: absolute; z-index: 5; top:' + settings['offset_top'] + '; left:' + settings['offset_left'] + '"><div class="qodef-offset-image-wrapper"><img src="' + settings['offset_image_url'] + '" alt="Offset Image"></div></div>' ).prependTo( $target );
			}

			if ( typeof settings['enable_dots'] !== 'undefined' && settings['enable_dots'] === 'dots' ) {
				var $layout = null;

				$layout = $( '<div class="qodef-dots-holder"><div class="qodef-dots--left"></div><div class="qodef-dots--right"></div></div>' ).prependTo( $target );

				setTimeout( function () {
					var $dotsHolder = $('.qodef-dots-holder');

					if ( $dotsHolder.length && qodef.windowWidth > 1024 ) {
						$dotsHolder.each( function () {
							var $thisHolder   = $( this ),
								$leftSection  = $thisHolder.find('.qodef-dots--left'),
								$rightSection = $thisHolder.find('.qodef-dots--right');

							if ( $leftSection.length ) {
								for ( var i = 0; i < 30; i++ ) {
									$leftSection.append($('<span class="qodef-dot-holder"><span class="qodef-dot"></span></span>'));
								}

								setTimeout( function () {
									var $leftDots = $leftSection.find('.qodef-dot-holder');

									if ( $leftDots.length ) {
										$leftDots.each( function () {
											var $thisDot = $( this );

											$thisDot.css({
												'left': Math.floor( Math.random() * Number( $leftSection.width() ) ),
												'top' : Math.floor( Math.random() * Number( $leftSection.height() ) )
											});
										});
									}
								}, 50);
							}

							if ( $rightSection.length ) {
								for ( var j = 0; j < 30; j++ ) {
									$rightSection.append($('<span class="qodef-dot-holder"><span class="qodef-dot"></span></span>'));
								}

								setTimeout( function () {
									var $rightDots = $rightSection.find('.qodef-dot-holder');

									if ( $rightDots.length ) {
										$rightDots.each( function () {
											var $thisDot = $( this );

											$thisDot.css({
												'left': Math.floor( Math.random() * Number( $rightSection.width() ) ),
												'top' : Math.floor( Math.random() * Number( $rightSection.height() ) )
											});
										});
									}
								}, 50);
							}

							$dotsHolder.appear( function () {
								$dotsHolder.addClass('qodef--appeared');
							}, { accX: 0, accY: -150 });
						});
					}
				}, 50);
			}
		}
	};

})( jQuery );
