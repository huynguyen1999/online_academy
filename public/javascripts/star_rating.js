$( '.stars-inner' ).css( "width", function ()
{
    const rating = $( this ).data( 'value' );
    return `${ Math.round( rating * 20 ) }%`;
} );