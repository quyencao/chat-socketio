(function () {

    angular.module('app')
        .directive('scrollBottom', function () {
            return {
                scope: {
                    list: '=chatMessageList'
                },
                template: `
                    <div ng-repeat="message in messages">
                    <div class="chat-message right" ng-if="message.id !== user.id">
                      <img class="message-avatar" src="https://bootdey.com/img/Content/avatar/avatar1.png" alt="">
                      <div class="message">
                        <a class="message-author" href="#"> {{ message.from }} </a>
                        <span class="message-date">{{ message.createdAt }} </span>
                        <span class="message-content">{{ message.message }}</span>
                      </div>
                    </div>
                    <div class="chat-message left" ng-if="message.id === user.id">
                      <img class="message-avatar" src="https://bootdey.com/img/Content/avatar/avatar1.png" alt="">
                      <div class="message" ng-style="{ backgroundColor: '#428bca' }">
                        <a class="message-author" ng-style="{ color: 'white' }" href="#"> {{ message.from }} </a>
                        <span class="message-date-me">{{ message.createdAt }} </span>
                        <span class="message-content" ng-style="{ color: 'white' }">{{ message.message }}</span>
                      </div>
                    </div>
                  </div>
                `,
                link: function(scope, element) {
                    scope.$watchCollection('list', function() {
                        var $list = $(element).find('.js-chat-list');
                        var scrollHeight = $list.prop('scrollHeight');
                        $list.animate({scrollTop: scrollHeight}, 500);
                    });
                }
            };
        });

}());