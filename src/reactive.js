function Reactive(data)
{
	var reactive = (this instanceof Reactive) ? this : { pointer : -1 };
		
	reactive.updateButton = document.querySelector('.update'),
	reactive.updateClickStream = Rx.Observable.fromEvent(updateButton, 'click');

	reactive.requestStream = reactive.updateClickStream.startWith('startup click')
		.flatMap(function(){
			reactive.pointer++;
			return reactive.pointer;
		});

	reactive.responseStream = reactive.requestStream
		.flatMap(function(p){
			return data[];
		})	

	reactive.responseStream.subscribe(function(d){
		reactive.data = d;
	})

	return reactive;
}
